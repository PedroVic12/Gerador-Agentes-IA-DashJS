import { useState, useEffect } from "react";
import { io } from "socket.io-client";
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
  // eslint-disable-next-line no-unused-vars
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
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [markdownResult, setMarkdownResult] = useState("");
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const newSocket = io('http://localhost:6000', {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5
    });
    
    newSocket.on('connect', () => {
      console.log(' Conectado ao servidor WebSocket');
      setConnectionStatus('connected');
    });

    newSocket.on('default_agents', (data) => {
      console.log(' Recebendo configuração padrão dos agentes:', data);
      if (data.agents) {
        setAgents(data.agents);
      }
    });

    newSocket.on('connection_status', (data) => {
      console.log(' Status da conexão:', data);
    });

    newSocket.on('configuration_status', (data) => {
      console.log(' Status da configuração:', data);
      setIsConfigValid(data.is_valid);
    });

    newSocket.on('task_results', (data) => {
      console.log(' Resultados recebidos:', data);
      setLoading(false);
      if (data.status === 'error') {
        console.error(' Erro:', data.markdown_result);
      }
      setMarkdownResult(data.markdown_result || '');
    });

    newSocket.on('connect_error', (error) => {
      console.error(' Erro de conexão:', error);
      setConnectionStatus('error');
      setLoading(false);
    });

    newSocket.on('disconnect', () => {
      console.log(' Desconectado do servidor');
      setConnectionStatus('disconnected');
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      // Only send check if we have either agents or a prompt
      if (agentOrder.length > 0 || prompt.trim()) {
        console.log(' Verificando configuração:', {
          agents: agentOrder.map(id => agents.find(a => a.id === id)),
          prompt
        });
        socket.emit('check_configuration', {
          agents: agentOrder.map(id => agents.find(a => a.id === id)),
          prompt
        });
      }
    }
  }, [agentOrder, prompt, socket, agents]);

  const handleAgentChange = (agentId, field, value) => {
    const updatedAgents = agents.map(agent => {
      if (agent.id === agentId) {
        return { ...agent, [field]: value };
      }
      return agent;
    });
    setAgents(updatedAgents);
  };

  const handleTaskChange = (agentId, taskIndex, value) => {
    const updatedAgents = agents.map(agent => {
      if (agent.id === agentId) {
        const updatedTasks = [...agent.tasks];
        updatedTasks[taskIndex] = value;
        return { ...agent, tasks: updatedTasks };
      }
      return agent;
    });
    setAgents(updatedAgents);
  };

  const handleStartTasks = () => {
    if (!socket || !socket.connected) {
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
      socket.emit('start_tasks', data);
    } catch (error) {
      console.error(' Erro ao enviar tarefas:', error);
      setLoading(false);
      alert('Erro ao iniciar tarefas. Por favor, tente novamente.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedId = parseInt(event.dataTransfer.getData('text/plain'));
    
    if (!agentOrder.includes(droppedId)) {
      const newOrder = [...agentOrder, droppedId];
      setAgentOrder(newOrder);
      
      // Trigger configuration check after updating agent order
      if (socket && socket.connected) {
        socket.emit('check_configuration', {
          agents: newOrder.map(id => agents.find(a => a.id === id)),
          prompt
        });
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
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '' : ''}
          </div>
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
                    draggable
                    onDragStart={(e) => setIsDragging(true)}
                    onClick={() => setAgentOrder([...agentOrder, agent.id])}
                    className="p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-all"
                  >

                    <Typography variant="subtitle1" gutterBottom>{agent.name}</Typography>
                    <TextField
                      label="Role"
                      value={agent.role}
                      onChange={(e) => handleAgentChange(agent.id, 'role', e.target.value)}
                      fullWidth
                      margin="dense"
                    />
                    <TextField
                      label="Goal"
                      value={agent.goal}
                      onChange={(e) => handleAgentChange(agent.id, 'goal', e.target.value)}
                      fullWidth
                      margin="dense"
                      multiline
                    />
                    <TextField
                      label="Backstory"
                      value={agent.backstory}
                      onChange={(e) => handleAgentChange(agent.id, 'backstory', e.target.value)}
                      fullWidth
                      margin="dense"
                      multiline
                    />
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
              <div className="drop-zone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <div className="flex flex-wrap gap-3 mb-4">
                  {agentOrder.map((agentId, index) => {
                    const agent = agents.find(a => a.id === agentId);
                    return (
                      <div key={agentId} className="w-full p-4 bg-green-50 rounded-lg">
                        <Typography variant="h6">{`${index + 1}. ${agent.name}`}</Typography>
                        {agent.tasks.map((task, taskIndex) => (
                          <TextField
                            key={taskIndex}
                            label={`Task ${taskIndex + 1}`}
                            value={task}
                            onChange={(e) => handleTaskChange(agent.id, taskIndex, e.target.value)}
                            fullWidth
                            margin="normal"
                            multiline
                          />
                        ))}
                        <TextField
                          label="Expected Output"
                          value={agent.expected_output}
                          onChange={(e) => handleAgentChange(agent.id, 'expected_output', e.target.value)}
                          fullWidth
                          margin="normal"
                          multiline
                        />
                        <Button
                          onClick={() => setAgentOrder(agentOrder.filter(id => id !== agentId))}
                          color="secondary"
                          variant="outlined"
                          style={{ marginTop: '10px' }}
                        >
                          Remover
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <TextField
                  label="Digite seu prompt aqui"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />

                {/* {isDragging ? (
                  <div className="drop-zone-active">
                    <Typography variant="body1">Solte os agentes aqui</Typography>
                  </div>
                ) : (
                  <div className="drop-zone">
                    <Typography variant="body1">Solte os agentes aqui</Typography>
                  </div>
                )} */}

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
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6" style={{ minHeight: '80vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Resultado
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              {markdownResult ? (
                <div className="markdown-result">
                  <ReactMarkdown>{markdownResult}</ReactMarkdown>
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Os resultados aparecerão aqui após o processamento
                </Typography>
              )}
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
