import socket
from equipe_agents_pv import Crew, Agent, Task
import os
import traceback
import logging
import json

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
            

    
