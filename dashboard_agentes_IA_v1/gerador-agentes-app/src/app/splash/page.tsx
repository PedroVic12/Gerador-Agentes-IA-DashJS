'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
      }}
    >
      <Box
        component="img"
        src="/react.svg"
        alt="React Logo"
        sx={{
          width: 150,
          height: 150,
          animation: 'spin 2s linear infinite',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      />
      <CircularProgress
        sx={{
          mt: 4,
          color: '#ff0000',
        }}
      />
    </Box>
  );
}
