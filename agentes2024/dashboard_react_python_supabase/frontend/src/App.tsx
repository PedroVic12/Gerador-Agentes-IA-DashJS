import { ChakraProvider, Container, Heading } from '@chakra-ui/react'
import Chat from './components/Chat'

function App() {
  return (
    <ChakraProvider>
      <Container maxW="container.xl" py={8}>
        <Heading mb={8} textAlign="center">AI Chat with Gemini</Heading>
        <Chat />
      </Container>
    </ChakraProvider>
  )
}

export default App
