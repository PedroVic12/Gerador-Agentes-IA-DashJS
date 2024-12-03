import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  Image,
  Flex,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai';
  image?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [clientId] = useState(uuidv4());
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}/${clientId}`);

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.response) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: data.response,
          type: 'ai'
        }]);
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [clientId, toast]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = () => {
    if (!input.trim() && !image) return;

    const newMessage: Message = {
      id: uuidv4(),
      text: input,
      type: 'user',
      image: image || undefined
    };

    setMessages(prev => [...prev, newMessage]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        text: input,
        image: image
      }));
    }

    setInput('');
    setImage(null);
  };

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <VStack spacing={4} align="stretch" h="80vh">
        <Box flex="1" overflowY="auto" p={4} borderWidth={1} borderRadius="md">
          {messages.map((message) => (
            <Box
              key={message.id}
              bg={message.type === 'user' ? 'blue.100' : 'gray.100'}
              p={3}
              borderRadius="md"
              mb={2}
              ml={message.type === 'user' ? 'auto' : 0}
              mr={message.type === 'ai' ? 'auto' : 0}
              maxW="70%"
            >
              {message.image && (
                <Image
                  src={message.image}
                  alt="Uploaded"
                  maxH="200px"
                  mb={2}
                  borderRadius="md"
                />
              )}
              <Text>{message.text}</Text>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box
          {...getRootProps()}
          p={4}
          borderWidth={2}
          borderRadius="md"
          borderStyle="dashed"
          textAlign="center"
          bg={isDragActive ? 'gray.100' : 'transparent'}
          cursor="pointer"
        >
          <input {...getInputProps()} />
          {image ? (
            <Image src={image} alt="Preview" maxH="100px" mx="auto" />
          ) : (
            <Text>Drag and drop an image here, or click to select one</Text>
          )}
        </Box>

        <Flex>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            mr={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <Button onClick={handleSubmit} colorScheme="blue">
            Send
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default Chat;
