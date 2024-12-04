import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [open, setOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:9400');

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'task_results') {
          setLoading(false);
          if (data.status === 'success') {
            setMarkdownResult(data.markdown_result || '');
          } else {
            console.error('Task execution failed:', data.message);
            alert('Erro ao executar as tarefas. Por favor, tente novamente.');
          }
        } else if (data.type === 'error') {
          setLoading(false);
          console.error('Server error:', data.message);
          alert(`Erro do servidor: ${data.message}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        setLoading(false);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnectionStatus('disconnected');
      setLoading(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
      setLoading(false);
      alert('Erro na conexão WebSocket. Por favor, recarregue a página.');
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  useEffect(() => {
    const isValid = agentOrder.length > 0 && prompt.trim() !== '';
    setIsConfigValid(isValid);
  
    console.log('isConfigValid:', isConfigValid);
    console.log('loading:', loading);
    console.log('agentOrder:', agentOrder);
    console.log('prompt:', prompt);
  }, [agentOrder.length, prompt, loading, isConfigValid]);

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
      console.error('WebSocket not connected');
      alert('Erro de conexão com o servidor. Por favor, recarregue a página.');
      return;
    }

    if (!prompt.trim()) {
      alert('Por favor, insira um tema antes de iniciar as tarefas.');
      return;
    }

    const selectedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory
    }));

    const tasks = [
      {
        description: `Pesquisar sobre ${prompt}`,
        agentId: 1,
        expected_output: 'Relatório detalhado.',
        attempts: 2
      },
      {
        description: `Escrever artigo em markdown sobre ${prompt}`,
        agentId: 2,
        expected_output: 'Artigo didático em markdown.',
        attempts: 2
      }
    ];

    const data = {
      tema: prompt,
      agents: selectedAgents,
      tasks: tasks
    };

    setLoading(true);
    setMarkdownResult(''); // Clear previous results

    console.log('Sending data to WebSocket:', data);
    ws.send(JSON.stringify({
      type: 'start_tasks',
      data
    }));
  };

  const handleSelectAgent = (agent) => {
    if (!agentOrder.includes(agent.id)) {
      const newOrder = [...agentOrder, agent.id];
      setAgentOrder(newOrder);
    }
  };

  const handleAddAgent = () => {
    const newAgent = {
      id: agents.length + 1,
      name: newAgentName,
      role: 'Novo Agente',
      goal: 'Definir objetivo',
      backstory: 'Definir história',
      tasks: [],
      expected_output: 'Definir saída esperada'
    };
    setAgents([...agents, newAgent]);
    setOpen(false);
    setNewAgentName("");
  };

  const handleClose = () => {
    setOpen(false);
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
              const websocket = new WebSocket('ws://localhost:4000');
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
                <Button onClick={() => setOpen(true)}>Adicionar Novo Agente</Button>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Adicionar Novo Agente</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="Nome do Agente"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      fullWidth
                      margin="dense"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleAddAgent}>Adicionar</Button>
                  </DialogActions>
                </Dialog>
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
                  isConfigValid ? 'Iniciar Tarefas de agentes IA' : 'Complete a Configuração'
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
