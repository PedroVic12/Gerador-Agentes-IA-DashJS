import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { Button, AppBar, Toolbar, Typography, Container, Paper, Grid, TextField, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';

function App() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Gerente",
      role: "Gerente",
      goal: "Coordenar fluxo de trabalho",
      backstory: "Responsável por gerenciar o processo",
      tasks: ["Revisar relatório", "Aprovar orçamento"],
    },
    {
      id: 2,
      name: "Pesquisador",
      role: "Pesquisador",
      goal: "Coletar informações",
      backstory: "Especialista em pesquisa de dados",
      tasks: ["Coletar dados", "Analisar tendências"],
    },
    {
      id: 3,
      name: "Escritor",
      role: "Escritor",
      goal: "Criar conteúdo",
      backstory: "Redator especializado",
      tasks: ["Escrever artigo", "Revisar texto"],
    },
    {
      id: 4,
      name: "Publicador",
      role: "Publicador",
      goal: "Formatar e publicar",
      backstory: "Especialista em markdown",
      tasks: ["Formatar documento", "Publicar conteúdo"],
    },
  ]);
  const [agentOrder, setAgentOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [markdownResult, setMarkdownResult] = useState("");

  const socket = useMemo(() => io('http://localhost:6000'), []);

  useEffect(() => {
    socket.on('task_results', (data) => {
      console.log('Received data:', data);
      setMarkdownResult(data.markdown_result);
      setLoading(false);
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const handleDragStart = (e, agent) => {
    e.target.classList.add("agent-drag");
    setIsDragging(true);
    e.dataTransfer.setData("agent", JSON.stringify(agent));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.remove("drop-zone-active");
    setIsDragging(false);
    const agent = JSON.parse(e.dataTransfer.getData("agent"));
    if (!agentOrder.find((a) => a.id === agent.id)) {
      const newOrder = [...agentOrder, agent];
      setAgentOrder(newOrder);
    }
  };

  const handleRemoveAgent = (agentId) => {
    setAgentOrder(agentOrder.filter((agent) => agent.id !== agentId));
  };

  const updateAgentTasks = (agentId, taskIndex, newTask) => {
    const updatedAgents = agentOrder.map((agent) => {
      if (agent.id === agentId) {
        const updatedTasks = [...agent.tasks];
        updatedTasks[taskIndex] = newTask;
        return { ...agent, tasks: updatedTasks };
      }
      return agent;
    });
    setAgentOrder(updatedAgents);
  };

  const addTaskToAgent = (agentId) => {
    const updatedAgents = agentOrder.map((agent) => {
      if (agent.id === agentId) {
        return { ...agent, tasks: [...agent.tasks, 'Nova Tarefa'] };
      }
      return agent;
    });
    setAgentOrder(updatedAgents);
  };

  const addNewAgent = () => {
    const newAgent = {
      id: agents.length + 1,
      name: `Agente ${agents.length + 1}`,
      role: '',
      goal: '',
      backstory: '',
      tasks: [],
    };
    setAgents([...agents, newAgent]);
  };

  const triggerTask = () => {
    setLoading(true);
    const taskData = agentOrder.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
      tasks: agent.tasks
    }));
    socket.emit('start_tasks', { agents: taskData, prompt: prompt });
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden font-roboto">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Gerador de Agentes IA
          </Typography>
          <Button color="inherit" onClick={triggerTask}>Start Tasks</Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: '20px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Agentes
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, agent)}
                    onClick={() => setAgentOrder([...agentOrder, agent])}
                    className="p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-all transform hover:-translate-y-1 hover:shadow-md flex items-center gap-3"
                  >
                    <Typography variant="body1">{agent.name}</Typography>
                  </div>
                ))}
              </div>
              <Button variant="contained" color="primary" fullWidth onClick={addNewAgent}>Adicionar Novo Agente</Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Área de Processamento
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <div
                className={`bg-white p-6 rounded-lg shadow-lg mb-6 min-h-[200px] transition-colors ${isDragging ? "drop-zone-active" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("drop-zone-active");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("drop-zone-active");
                }}
              >
                <div className="flex flex-wrap gap-3">
                  {agentOrder.map((agent, index) => (
                    <div
                      key={agent.id}
                      className="flex flex-col items-center bg-green-100 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-shadow"
                      style={{ width: '150px' }}
                    >
                      <Typography variant="body2">{`${index + 1}. ${agent.name}`}</Typography>
                      <Button
                        onClick={() => handleRemoveAgent(agent.id)}
                        color="secondary"
                        size="small"
                        style={{ marginTop: '10px' }}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
                <TextField
                  label={`Digite o prompt para a equipe ${agentOrder.map((agent) => agent.name).join(', ')}`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {loading && <Typography variant="body2" color="primary" align="center" style={{ marginTop: '10px' }}>Carregando...</Typography>}
              </div>

              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a', marginTop: '20px' }}>
                Resultado
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              <Paper elevation={2} className="p-4 markdown-content" style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                <ReactMarkdown>
                  {markdownResult || "Markdown resultado a ser exibido aqui..."}
                </ReactMarkdown>
              </Paper>

            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" gutterBottom style={{ color: '#6a1b9a' }}>
                Tarefas
              </Typography>
              <Divider style={{ marginBottom: '10px' }} />
              {agentOrder.map((agent) => (
                <div key={agent.id} className="p-4 bg-gray-50 rounded-lg mb-3">
                  <Typography variant="body1" gutterBottom>{agent.name}</Typography>
                  {agent.tasks.map((task, index) => (
                    <TextField
                      key={index}
                      label={`Tarefa ${index + 1}`}
                      value={task}
                      onChange={(e) => updateAgentTasks(agent.id, index, e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  ))}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => addTaskToAgent(agent.id)}
                    style={{ marginTop: '10px' }}
                  >
                    Adicionar Tarefa
                  </Button>
                </div>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <style jsx global>{`
        .agent-drag {
          transform: scale(1.05);
          opacity: 0.8;
          transition: all 0.2s ease;
        }
        .drop-zone-active {
          background-color: #e8f4ff;
          border: 2px dashed #60a5fa;
        }
      `}</style>
    </div>
  );
}

export default App;
