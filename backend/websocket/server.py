from flask import Flask
from flask_socketio import SocketIO
from equipe_agents_pv import Crew, Agent, Task

app = Flask(__name__)
socketio = SocketIO(app)

# Define agents
buscador = Agent(
    role="Pesquisador",
    goal="Pesquisar informações relevantes sobre o assunto",
    backstory="Você é um pesquisador experiente e está sempre em busca de informações relevantes."
)

redator = Agent(
    role="Redator",
    goal="Escrever um artigo informativo sobre o assunto",
    backstory="Você é um redator experiente e está sempre buscando escrita limpa e facil de entendimento."
)

# Define tasks
pesquisa = Task(
    description="Pesquisar sobre {tema} com as fontes mais recentes e confiáveis",
    agent=buscador,
    expected_output="Um relatório  com parágrafos contendo Introdução, Desenvolvimento, e Conclusão",
    attempts=2
)

escrita = Task(
    description="Escrever um artigo em formato markdown sobre {tema} com base na pesquisa realizada",
    agent=redator,
    expected_output="Arquivo markdown bem escrito e objetivo de forma didática",
    attempts=2
)

# Create the crew
equipe = Crew(
    agents=[buscador, redator],
    tasks=[pesquisa, escrita]
)

@app.route('/')
def index():
    return "WebSocket server is running"

@socketio.on('message')
def handle_message(msg):
    print('Received message:', msg)
    socketio.send(msg, broadcast=True)

@socketio.on('start_tasks')
def handle_start_tasks(data):
    tema = data.get('tema', "")
    entradas = {"tema": tema}
    results = equipe.kickoff(inputs=entradas)
    socketio.emit('task_results', results)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=6000, debug=True)
