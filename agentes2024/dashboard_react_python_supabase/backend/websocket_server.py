import asyncio
import json
import os
import base64
from io import BytesIO
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro-vision')

# Configure Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]

    async def broadcast_to_client(self, message: str, client_id: str):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                await connection.send_text(message)

manager = ConnectionManager()

async def process_gemini_request(text: str, image_data: str = None) -> str:
    try:
        if image_data:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(BytesIO(image_bytes))
            
            # Generate response with both text and image
            response = model.generate_content([text, image])
        else:
            # Generate response with only text
            response = model.generate_content(text)
        
        return response.text
    except Exception as e:
        return f"Error processing request: {str(e)}"

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                text = message_data.get("text", "")
                image_data = message_data.get("image")
                
                # Process with Gemini
                response = await process_gemini_request(text, image_data)
                
                # Store in Supabase
                supabase.table("conversations").insert({
                    "client_id": client_id,
                    "user_message": text,
                    "has_image": bool(image_data),
                    "ai_response": response
                }).execute()
                
                # Send response back to client
                await manager.broadcast_to_client(
                    json.dumps({"response": response}),
                    client_id
                )
                
            except json.JSONDecodeError:
                await manager.broadcast_to_client(
                    json.dumps({"error": "Invalid message format"}),
                    client_id
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
