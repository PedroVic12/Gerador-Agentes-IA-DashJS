import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { Button, AppBar, Toolbar, Typography, Container, Paper, Grid } from '@mui/material';

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
  const [state, setState] = useState({ left: false, right: false });
  const [isDragging, setIsDragging] = useState(false);

  const socket = useMemo(() => io('http://localhost:6000'), []);

  useEffect(() => {
    socket.on('task_results', (data) => {
      console.log('Received data:', data);
      setLoading(false);
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

  const triggerTask = () => {
    setLoading(true);
    socket.emit('start_tasks', { tema: 'Your Theme Here' });
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
              <Typography variant="h6" gutterBottom>
                Agentes
              </Typography>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, agent)}
                    onClick={() => setAgentOrder([...agentOrder, agent])}
                    className="p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-all transform hover:-translate-y-1 hover:shadow-md flex items-center gap-3"
                  >
                    <Typography variant="body1">{agent.name}</Typography>
                  </div>
                ))}
              </div>
              <Button variant="contained" color="primary" fullWidth onClick={() => setAgents([...agents, { id: agents.length + 1, name: '', role: '', goal: '', backstory: '', tasks: [] }])}>Adicionar Novo Agente</Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" gutterBottom>
                Área de Processamento
              </Typography>
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
                      className="flex items-center bg-blue-50 px-4 py-2 rounded-full shadow-sm hover:shadow transition-shadow"
                    >
                      <Typography variant="body2">{`${index + 1}. ${agent.name}`}</Typography>
                      <Button
                        onClick={() => handleRemoveAgent(agent.id)}
                        color="secondary"
                        size="small"
                        style={{ marginLeft: '10px' }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                {loading && <Typography variant="body2" color="primary" align="center" style={{ marginTop: '10px' }}>Carregando...</Typography>}
                {agentOrder.map((agent) => (
                  <div key={agent.id} className="p-4 bg-gray-50 rounded-lg mb-3">
                    <Typography variant="body1" gutterBottom>{agent.name}</Typography>
                    {agent.tasks.map((task, index) => (
                      <Typography key={index} variant="body2">{task}</Typography>
                    ))}
                  </div>
                ))}
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} className="p-6">
              <Typography variant="h6" gutterBottom>
                Tarefas
              </Typography>
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
