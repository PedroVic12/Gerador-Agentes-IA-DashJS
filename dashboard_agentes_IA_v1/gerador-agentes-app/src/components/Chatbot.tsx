'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Button,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const suggestedActions = [
  { text: 'Gerar Checklist', icon: <CheckCircleIcon />, action: 'checklist' },
  { text: 'Análise de Manutenção', icon: <BuildIcon />, action: 'maintenance' },
  { text: 'Ver Relatórios', icon: <AssessmentIcon />, action: 'reports' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Olá! Sou o assistente de manutenção. Como posso ajudar?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulated bot response
    setTimeout(() => {
      const botMessage: Message = {
        text: 'Entendi sua solicitação. Como posso ajudar com isso?',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleActionClick = (action: string) => {
    let message = '';
    switch (action) {
      case 'checklist':
        message = 'Gerando novo checklist de manutenção...';
        break;
      case 'maintenance':
        message = 'Analisando histórico de manutenção...';
        break;
      case 'reports':
        message = 'Preparando relatórios...';
        break;
    }

    const botMessage: Message = {
      text: message,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsOpen(true)}
      >
        <ChatIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, bgcolor: 'background.default' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Assistente de Manutenção
            </Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
            {suggestedActions.map((action) => (
              <Button
                key={action.action}
                variant="outlined"
                size="small"
                startIcon={action.icon}
                onClick={() => handleActionClick(action.action)}
              >
                {action.text}
              </Button>
            ))}
          </Box>

          <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              InputProps={{
                endAdornment: (
                  <IconButton color="primary" onClick={handleSend}>
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
