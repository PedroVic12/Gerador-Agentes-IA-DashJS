from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from equipe_agents_pv import Crew, Agent, Task

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

def create_agent_from_data(agent_data):
    return Agent(
        role=agent_data.get('role', ''),
        goal=agent_data.get('goal', ''),
        backstory=agent_data.get('backstory', '')
    )

def create_task_for_agent(agent, tasks):
    return Task(
        description="\n".join(tasks),  # Join all tasks into one description
        agent=agent,
        expected_output="Resultado em formato markdown",
        attempts=2
    )

@app.route('/')
def index():
    return "WebSocket server is running"

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_tasks')
def handle_start_tasks(data):
    try:
        print("Received data:", data)
        agents_data = data.get('agents', [])
        prompt = data.get('prompt', '')

        # Create agents and tasks dynamically
        all_agents = []
        all_tasks = []

        for agent_data in agents_data:
            agent = create_agent_from_data(agent_data)
            all_agents.append(agent)
            task = create_task_for_agent(agent, agent_data.get('tasks', []))
            all_tasks.append(task)

        # Create the crew
        equipe = Crew(agents=all_agents, tasks=all_tasks)

        # Execute tasks
        results = equipe.kickoff(inputs={'tema': prompt})
        
        # Format results as markdown
        markdown_result = "# Resultado da Execução\n\n"
        for i, (agent_data, result) in enumerate(zip(agents_data, results)):
            markdown_result += f"## {agent_data['name']}\n\n"
            markdown_result += f"{result}\n\n"

        socketio.emit('task_results', {'status': 'success', 'markdown_result': markdown_result})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        socketio.emit('task_results', {
            'status': 'error',
            'markdown_result': f"# Erro na Execução\n\nOcorreu um erro: {str(e)}"
        })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=6000, debug=True)
