import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  TextField,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import ReactMarkdown from "react-markdown";

function App() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Pesquisador",
      role: "Pesquisador",
      goal: "Pesquisar informações relevantes sobre o assunto",
      backstory: "Você é um pesquisador experiente e está sempre em busca de informações relevantes.",
      tasks: ["Pesquisar sobre o tema com as fontes mais recentes e confiáveis"],
      expected_output: "Um relatório com parágrafos contendo Introdução, Desenvolvimento, e Conclusão",
    },
    {
      id: 2,
      name: "Redator",
      role: "Redator",
      goal: "Escrever um artigo informativo sobre o assunto",
      backstory: "Você é um redator experiente e está sempre buscando escrita limpa e facil de entendimento.",
      tasks: ["Escrever um artigo em formato markdown sobre o tema com base na pesquisa realizada"],
      expected_output: "Arquivo markdown bem escrito e objetivo de forma didática",
    },
  ]);

  const [agentOrder, setAgentOrder] = useState([]);
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [markdownResult, setMarkdownResult] = useState("");
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:6000');

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from server ', data);
      switch (data.type) {
        case 'default_agents':
          if (data.agents) {
            setAgents(data.agents);
          }
          break;
        case 'connection_status':
          console.log(' Status da conexão:', data);
          break;
        case 'configuration_status':
          console.log(' Status da configuração:', data);
          setIsConfigValid(data.is_valid);
          break;
        case 'task_results':
          console.log(' Resultados recebidos:', data);
          setLoading(false);
          if (data.status === 'error') {
            console.error(' Erro:', data.markdown_result);
          }
          setMarkdownResult(data.markdown_result || '');
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnectionStatus('disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error: ', error);
      setConnectionStatus('error');
      setLoading(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Only send check if we have either agents or a prompt
      if (agentOrder.length > 0 || prompt.trim()) {
        console.log(' Verificando configuração:', {
          agents: agentOrder.map(id => agents.find(a => a.id === id)),
          prompt
        });
        ws.send(JSON.stringify({
          type: 'check_configuration',
          agents: agentOrder.map(id => agents.find(a => a.id === id)),
          prompt
        }));
      }
    }
  }, [agentOrder, prompt, ws, agents]);

  const handleAgentChange = (agentId, field, value) => {
    const updatedAgents = agents.map(agent => {
      if (agent.id === agentId) {
        return { ...agent, [field]: value };
      }
      return agent;
    });
    setAgents(updatedAgents);
  };

  const handleSaveTasks = (agent) => {
    console.log('Salvando tarefas para agente:', agent);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update_agent',
        agent
      }));
    }
  };

  const handleStartTasks = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error(' WebSocket não conectado');
      alert('Erro de conexão com o servidor. Por favor, recarregue a página.');
      return;
    }

    if (!isConfigValid) {
      alert('Por favor, complete a configuração antes de iniciar as tarefas.');
      return;
    }

    setLoading(true);
    setMarkdownResult('');

    const selectedAgents = agentOrder.map(id => {
      const agent = agents.find(a => a.id === id);
      return {
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
        backstory: agent.backstory,
        tasks: agent.tasks,
        expected_output: agent.expected_output
      };
    });

    const data = {
      agents: selectedAgents,
      prompt: prompt
    };

    console.log(' Enviando dados para o servidor:', data);
    
    try {
      ws.send(JSON.stringify({
        type: 'start_tasks',
        data
      }));
    } catch (error) {
      console.error(' Erro ao enviar tarefas:', error);
      setLoading(false);
      alert('Erro ao iniciar tarefas. Por favor, tente novamente.');
    }
  };

  const handleSelectAgent = (agent) => {
    if (!agentOrder.includes(agent.id)) {
      const newOrder = [...agentOrder, agent.id];
      setAgentOrder(newOrder);

      // Send agent data to WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'update_agent',
          agent
        }));
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden font-roboto">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Gerador de Agentes IA
          </Typography>
          <Button color="inherit" onClick={() => {
            if (connectionStatus !== 'connected') {
              const websocket = new WebSocket('ws://localhost:6000');
              websocket.onopen = () => {
                console.log('Connected to WebSocket server');
                setConnectionStatus('connected');
              };
              websocket.onmessage = (event) => {
                console.log('Message from server ', event.data);
              };
              websocket.onclose = () => {
                console.log('Disconnected from WebSocket server');
                setConnectionStatus('disconnected');
              };
              websocket.onerror = (error) => {
                console.error('WebSocket error: ', error);
                setConnectionStatus('error');
              };
              setWs(websocket);
            } else {
              alert(`Status: ${connectionStatus}`);
            }
          }}>
            {connectionStatus === 'connected' ? 'Conectado :)' : 'Desconectado :('}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6" style={{ minHeight: '80vh' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Agentes Disponíveis
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <div className="flex flex-col gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-all"
                  >
                    <Typography variant="subtitle1" gutterBottom>{agent.name}</Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleSelectAgent(agent)}
                      fullWidth
                    >
                      Selecionar Agente
                    </Button>
                    <TextField
                      label="Tarefas"
                      value={agent.tasks.join(', ')}
                      onChange={(e) => handleAgentChange(agent.id, 'tasks', e.target.value.split(', '))}
                      fullWidth
                      margin="dense"
                      multiline
                    />
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleSaveTasks(agent)}
                      fullWidth
                      style={{ marginTop: '10px' }}
                    >
                      Salvar Tarefas
                    </Button>
                  </div>
                ))}
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="p-6" style={{ minHeight: '80vh' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Área de Processamento
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <TextField
                label="Digite seu prompt aqui"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <ReactMarkdown>{markdownResult}</ReactMarkdown>
              <Button
                variant="contained"
                color={isConfigValid ? "success" : "error"}
                onClick={handleStartTasks}
                disabled={loading || !isConfigValid}
                style={{ marginTop: '20px', marginBottom: '20px' }}
                fullWidth
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Processando</span>
                    <div className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                ) : (
                  isConfigValid ? ' Iniciar Tarefas de agentes IA' : ' Complete a Configuração'
                )}
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6" style={{ minHeight: '80vh' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Tarefas dos Agentes
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <div className="flex flex-col gap-3">
                {agentOrder.map((agentId) => {
                  const agent = agents.find(a => a.id === agentId);
                  return (
                    <div key={agentId} className="p-4 bg-blue-100 rounded-lg">
                      <Typography variant="subtitle1">{agent.name}</Typography>
                      <ul>
                        {agent.tasks.map((task, index) => (
                          <li key={index}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <style jsx global>{`
        .drop-zone {
          min-height: 200px;
          border: 2px dashed #6a1b9a;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .drop-zone-active {
          background-color: rgba(106, 27, 154, 0.1);
          border-color: #4a148c;
        }
        .loading-dots span {
          animation: dots 1.5s infinite;
          animation-fill-mode: both;
          margin-right: 2px;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dots {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .markdown-result {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .markdown-result h1, 
        .markdown-result h2, 
        .markdown-result h3 {
          color: #6a1b9a;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .markdown-result pre {
          background: #f1f1f1;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
        }
        .connection-status {
          padding: 8px;
          border-radius: 4px;
          margin-left: 16px;
        }
        .connection-status.connected {
          background-color: rgba(0, 255, 0, 0.1);
        }
        .connection-status.disconnected,
        .connection-status.error {
          background-color: rgba(255, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default App;
