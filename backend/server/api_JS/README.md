# Node.js MongoDB REST API

A robust REST API built with Express.js and MongoDB for managing posts with image uploads.

## Architecture

```
api_JS/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/        # Database schemas
│   ├── repositories/  # Database operations
│   ├── routes/        # API routes
│   └── middleware/    # Custom middleware
├── .env              # Environment variables
├── index.js          # Application entry point
├── server.js         # Server configuration
└── package.json      # Project dependencies
```

## Features

- CRUD operations for posts
- Image upload support
- MongoDB integration
- Error handling
- Input validation
- Environment configuration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Multer (file uploads)
- dotenv (environment variables)

## API Endpoints

### Posts

```
GET /posts         # List all posts
GET /posts/:id     # Get single post
POST /posts        # Create new post
PUT /posts/:id     # Update post
DELETE /posts/:id  # Delete post
```

### Request Body Example (POST /posts)

```json
{
    "descricao": "Post description",
    "imagemUrl": "https://example.com/image.jpg",
    "classificacao": 5
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

3. Start the server:
```bash
npm start
```

## Project Structure Details

### Controllers
Handle HTTP requests and responses. They:
- Validate input
- Call appropriate repository methods
- Format responses

### Models
Define MongoDB schemas and models for:
- Posts
- Other data structures

### Repositories
Contain database operations:
- CRUD operations
- Custom queries
- Data transformations

### Routes
Define API endpoints and connect them to controllers

### Middleware
Custom middleware for:
- Error handling
- Authentication (if implemented)
- Request processing

## Error Handling

The API implements centralized error handling with appropriate HTTP status codes and error messages.

## Development

To run in development mode with automatic restart:
```bash
npm run dev
```

## Testing

You can test the API using curl or Postman. Example requests:

```bash
# Create a post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Test post",
    "imagemUrl": "https://example.com/image.jpg",
    "classificacao": 5
  }'

# Get all posts
curl http://localhost:3000/posts

# Get single post
curl http://localhost:3000/posts/:id
```
