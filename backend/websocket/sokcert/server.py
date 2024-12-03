import socket
import threading
import base64
import hashlib
import os
import json
import traceback
from equipe_agents_pv import Crew, Agent, Task

# WebSocket handshake response template
HANDSHAKE_RESPONSE = (
    "HTTP/1.1 101 Switching Protocols\r\n"
    "Upgrade: websocket\r\n"
    "Connection: Upgrade\r\n"
    "Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
)

def handle_client_connection(client_socket):
    try:
        # Receive the client's handshake request
        request = client_socket.recv(1024).decode('utf-8')
        headers = parse_headers(request)
        websocket_accept_key = create_accept_key(headers['Sec-WebSocket-Key'])
        
        # Send the handshake response
        response = HANDSHAKE_RESPONSE.format(accept_key=websocket_accept_key)
        client_socket.send(response.encode('utf-8'))
        
        # Now the connection is upgraded to WebSocket
        while True:
            message = client_socket.recv(1024)
            if not message:
                break
            # Echo the message back to the client
            client_socket.send(message)
    finally:
        client_socket.close()

def parse_headers(request):
    headers = {}
    lines = request.split("\r\n")
    for line in lines[1:]:
        if line:
            key, value = line.split(": ", 1)
            headers[key] = value
    return headers

def create_accept_key(sec_websocket_key):
    GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
    accept_key = sec_websocket_key + GUID
    hashed_key = hashlib.sha1(accept_key.encode('utf-8')).digest()
    return base64.b64encode(hashed_key).decode('utf-8')

def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('0.0.0.0', 6000))
    server_socket.listen(5)
    print("WebSocket server started on port 6000")

    while True:
        client_socket, addr = server_socket.accept()
        print(f"Connection from {addr}")
        client_handler = threading.Thread(
            target=handle_client_connection,
            args=(client_socket,)
        )
        client_handler.start()

if __name__ == '__main__':
    start_server()
