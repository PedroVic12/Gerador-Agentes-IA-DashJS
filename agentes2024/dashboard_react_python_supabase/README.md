# AI Chat Dashboard with React, Python, and Supabase

This project implements a real-time chat application with AI capabilities using Google's Gemini model. It features WebSocket communication, image upload support, and conversation history storage in Supabase.

## Features

- Real-time chat with WebSocket communication
- Image upload and preview
- Integration with Google's Gemini AI model
- Conversation history storage in Supabase
- Modern UI with Chakra UI
- TypeScript support

## Project Structure

```
dashboard_react_python_supabase/
├── frontend/               # React frontend application
├── backend/               # Python WebSocket server
├── api/                   # API endpoints (if needed)
└── database/             # Database schema and migrations
```

## Prerequisites

- Node.js 16+
- Python 3.8+
- Supabase account
- Google Cloud account with Gemini API access

## Setup

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory:
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WEBSOCKET_URL=ws://localhost:8000/ws
   ```

### Database Setup

1. Create a new project in Supabase
2. Execute the SQL commands from `database/schema.sql` in the Supabase SQL editor

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   python websocket_server.py
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Development

### Backend Development

The backend uses FastAPI with WebSocket support and integrates with:
- Google's Gemini AI model for processing text and images
- Supabase for storing conversation history
- WebSocket for real-time communication

### Frontend Development

The frontend is built with:
- React + TypeScript
- Chakra UI for components
- react-dropzone for file uploads
- WebSocket for real-time communication

## Security Considerations

- Implement proper authentication in production
- Secure WebSocket connections
- Rate limit API requests
- Validate file uploads
- Sanitize user input
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
