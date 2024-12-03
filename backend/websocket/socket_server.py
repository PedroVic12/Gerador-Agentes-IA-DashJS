import socket
from equipe_agents_pv import Crew, Agent, Task
import os
import traceback
import logging
import json
import threading
import hashlib
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Default agents configuration
DEFAULT_AGENTS = [
    {
        "id": 1,
        "name": "Pesquisador",
        "role": "Pesquisador",
        "goal": "Pesquisar informações relevantes sobre o assunto",
        "backstory": "Você é um pesquisador experiente e está sempre em busca de informações relevantes.",
        "tasks": ["Pesquisar sobre o tema com as fontes mais recentes e confiáveis"],
        "expected_output": "Um relatório com parágrafos contendo Introdução, Desenvolvimento, e Conclusão"
    },
    {
        "id": 2,
        "name": "Redator",
        "role": "Redator",
        "goal": "Escrever um artigo informativo sobre o assunto",
        "backstory": "Você é um redator experiente e está sempre buscando escrita limpa e facil de entendimento.",
        "tasks": ["Escrever um artigo em formato markdown sobre o tema com base na pesquisa realizada"],
        "expected_output": "Arquivo markdown bem escrito e objetivo de forma didática"
    }
]

def create_agent_from_data(agent_data):
    try:
        logger.info(f"🤖 Criando agente: {agent_data.get('name')}")
        agent = Agent(
            role=agent_data.get('role', ''),
            goal=agent_data.get('goal', ''),
            backstory=agent_data.get('backstory', '')
        )
        logger.info(f"✅ Agente {agent_data.get('name')} criado com sucesso")
        return agent
    except Exception as e:
        logger.error(f"❌ Erro ao criar agente: {str(e)}")
        raise

def create_tasks_for_agent(agent, agent_data, tema):
    try:
        logger.info(f"📝 Criando tarefas para o agente: {agent_data.get('name')}")
        tasks = agent_data.get('tasks', [])
        task_descriptions = []
        for task in tasks:
            task_descriptions.append(f"- {task}")
        
        description = f"""
Contexto: {tema}

Tarefas a serem realizadas:
{chr(10).join(task_descriptions)}

Role: {agent_data.get('role')}
Goal: {agent_data.get('goal')}
"""
        
        task = Task(
            description=description,
            agent=agent,
            expected_output=agent_data.get('expected_output', "Resultado em formato markdown com estrutura clara e objetiva"),
            attempts=2
        )
        logger.info(f"✅ Tarefas criadas com sucesso para {agent_data.get('name')}")
        return task
    except Exception as e:
        logger.error(f"❌ Erro ao criar tarefas: {str(e)}")
        raise


class SocketServer:
    def __init__(self):
        self.crew = Crew()
        self.agents = DEFAULT_AGENTS

    def handle_start_tasks(self, data):
        try:
            logger.info("\n=== 🚀 Iniciando Execução das Tarefas ===")
            logger.info(f"📥 Dados recebidos: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            agents_data = data.get('agents', [])
            prompt = data.get('prompt', '')
            
            if not prompt.strip():
                raise ValueError("❌ O prompt não pode estar vazio")
            
            if not agents_data:
                raise ValueError("❌ Nenhum agente selecionado")

            logger.info(f"\n📝 Processando prompt: {prompt}")
            logger.info(f"👥 Número de agentes: {len(agents_data)}")

            # Create agents and tasks
            all_agents = []
            all_tasks = []

            for agent_data in agents_data:
                try:
                    logger.info(f"\n🤖 Processando agente: {agent_data.get('name')}")
                    agent = create_agent_from_data(agent_data)
                    all_agents.append(agent)
                    
                    task = create_tasks_for_agent(agent, agent_data, prompt)
                    all_tasks.append(task)
                except Exception as e:
                    logger.error(f"❌ Erro ao processar agente {agent_data.get('name')}: {str(e)}")
                    raise

            self.crew = Crew(agents=all_agents, tasks=all_tasks)
            logger.info(f"\n✅ Tarefas criadas com sucesso para {len(all_agents)} agentes")
        except Exception as e:
            logger.error(f"❌ Erro ao criar tarefas: {str(e)}")
            raise

        try:
            results = self.crew.kickoff({"tema": prompt})
            logger.info(f"\n✅ Tarefas concluidas com sucesso para {len(all_agents)} agentes")
            logger.info(f"\n📝 Resultados das tarefas:"
                        f"\n{chr(10).join(results)}")
        except Exception as e:
            logger.error(f"❌ Erro ao executar tarefas: {str(e)}")
            

# WebSocket handshake response template
HANDSHAKE_RESPONSE = (
    "HTTP/1.1 101 Switching Protocols\r\n"
    "Upgrade: websocket\r\n"
    "Connection: Upgrade\r\n"
    "Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
)


class WebSocketServer:
    def __init__(self, host='0.0.0.0', port=6000):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def start(self):
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        logger.info(f"WebSocket server started on port {self.port}")

        while True:
            client_socket, addr = self.server_socket.accept()
            logger.info(f"Connection from {addr}")
            client_handler = threading.Thread(
                target=self.handle_client_connection,
                args=(client_socket,)
            )
            client_handler.start()

    def handle_client_connection(self, client_socket):
        try:
            request = client_socket.recv(1024).decode('utf-8')
            headers = self.parse_headers(request)
            websocket_accept_key = self.create_accept_key(headers['Sec-WebSocket-Key'])
            response = HANDSHAKE_RESPONSE.format(accept_key=websocket_accept_key)
            client_socket.send(response.encode('utf-8'))

            while True:
                message = self.receive_message(client_socket)
                if not message:
                    break
                self.send_message(client_socket, message)
        finally:
            client_socket.close()

    def parse_headers(self, request):
        headers = {}
        lines = request.split("\r\n")
        for line in lines[1:]:
            if line:
                key, value = line.split(": ", 1)
                headers[key] = value
        return headers

    def create_accept_key(self, sec_websocket_key):
        GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        accept_key = sec_websocket_key + GUID
        hashed_key = hashlib.sha1(accept_key.encode('utf-8')).digest()
        return base64.b64encode(hashed_key).decode('utf-8')

    def receive_message(self, client_socket):
        byte1, byte2 = client_socket.recv(2)
        opcode = byte1 & 0b00001111
        masked = byte2 & 0b10000000
        payload_length = byte2 & 0b01111111

        if masked != 128:
            raise ValueError("Client frames must be masked")

        if payload_length == 126:
            payload_length = int.from_bytes(client_socket.recv(2), 'big')
        elif payload_length == 127:
            payload_length = int.from_bytes(client_socket.recv(8), 'big')

        masks = client_socket.recv(4)
        message_bytes = bytearray(client_socket.recv(payload_length))

        for i in range(payload_length):
            message_bytes[i] ^= masks[i % 4]

        return message_bytes.decode('utf-8')

    def send_message(self, client_socket, message):
        message = message.encode('utf-8')
        byte1 = 0b10000001
        length = len(message)

        if length <= 125:
            header = bytes([byte1, length])
        elif length <= 65535:
            header = bytes([byte1, 126]) + length.to_bytes(2, 'big')
        else:
            header = bytes([byte1, 127]) + length.to_bytes(8, 'big')

        client_socket.send(header + message)

# Start the WebSocket server
if __name__ == '__main__':
    ws_server = WebSocketServer()
    ws_server.start()
