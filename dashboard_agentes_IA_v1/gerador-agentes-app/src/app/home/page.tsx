'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Build as BuildIcon } from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h2" component="h1" gutterBottom>
          Bem-vindo ao Sistema de Manutenção
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Gerencie suas manutenções de forma inteligente
        </Typography>
        <Typography variant="body1" sx={{ mt: 4, mb: 6 }}>
          Um dashboard completo com IA para ajudar você a manter tudo funcionando perfeitamente.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<BuildIcon />}
          onClick={() => router.push('/dashboard')}
          sx={{
            backgroundColor: '#ff0000',
            '&:hover': {
              backgroundColor: '#cc0000',
            },
            borderRadius: 2,
            py: 1.5,
            px: 4,
          }}
        >
          Acessar Dashboard
        </Button>
      </Container>
    </Box>
  );
}
