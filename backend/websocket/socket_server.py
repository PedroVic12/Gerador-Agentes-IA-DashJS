import socket
import threading
import base64
import hashlib
import json
from equipe_agents_pv import Crew, Agent, Task

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# WebSocket handshake response template
HANDSHAKE_RESPONSE = (
    "HTTP/1.1 101 Switching Protocols\r\n"
    "Upgrade: websocket\r\n"
    "Connection: Upgrade\r\n"
    "Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
)

class WebSocketServer:
    def __init__(self, host='0.0.0.0', port=6000):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def start(self):
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        logger.info(f"WebSocket server started on port {self.port}")

        while True:
            client_socket, addr = self.server_socket.accept()
            logger.info(f"Connection from {addr}")
            client_handler = threading.Thread(
                target=self.handle_client_connection,
                args=(client_socket,)
            )
            client_handler.start()

    def handle_client_connection(self, client_socket):
        try:
            request = client_socket.recv(1024).decode('utf-8')
            headers = self.parse_headers(request)
            websocket_accept_key = self.create_accept_key(headers['Sec-WebSocket-Key'])
            response = HANDSHAKE_RESPONSE.format(accept_key=websocket_accept_key)
            client_socket.send(response.encode('utf-8'))

            while True:
                message = self.receive_message(client_socket)
                if not message:
                    break
                # Process the message and send a response
                self.send_message(client_socket, "Echo: " + message)
        finally:
            client_socket.close()

    def parse_headers(self, request):
        headers = {}
        lines = request.split("\r\n")
        for line in lines[1:]:
            if line:
                key, value = line.split(": ", 1)
                headers[key] = value
        return headers

    def create_accept_key(self, sec_websocket_key):
        GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        accept_key = sec_websocket_key + GUID
        hashed_key = hashlib.sha1(accept_key.encode('utf-8')).digest()
        return base64.b64encode(hashed_key).decode('utf-8')

    def receive_message(self, client_socket):
        byte1, byte2 = client_socket.recv(2)
        opcode = byte1 & 0b00001111
        masked = byte2 & 0b10000000
        payload_length = byte2 & 0b01111111

        if masked != 128:
            raise ValueError("Client frames must be masked")

        if payload_length == 126:
            payload_length = int.from_bytes(client_socket.recv(2), 'big')
        elif payload_length == 127:
            payload_length = int.from_bytes(client_socket.recv(8), 'big')

        masks = client_socket.recv(4)
        message_bytes = bytearray(client_socket.recv(payload_length))

        for i in range(payload_length):
            message_bytes[i] ^= masks[i % 4]

        return message_bytes.decode('utf-8')

    def send_message(self, client_socket, message):
        message = message.encode('utf-8')
        byte1 = 0b10000001
        length = len(message)

        if length <= 125:
            header = bytes([byte1, length])
        elif length <= 65535:
            header = bytes([byte1, 126]) + length.to_bytes(2, 'big')
        else:
            header = bytes([byte1, 127]) + length.to_bytes(8, 'big')

        client_socket.send(header + message)

if __name__ == '__main__':
    ws_server = WebSocketServer()
    ws_server.start()