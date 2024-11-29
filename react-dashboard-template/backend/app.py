from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)
CORS(app)

# Database setup
Base = declarative_base()
engine = create_engine('sqlite:///clients.db')
Session = sessionmaker(bind=engine)

class Client(Base):
    __tablename__ = 'clients'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(Text)

Base.metadata.create_all(engine)

# Routes
@app.route('/', methods=['GET'])
def index():
    #renderizar um componentes react
    return '<h1>API de Gerenciamento de Clientes</h1>'
    

@app.route('/api/clients', methods=['GET'])
def get_clients():
    session = Session()
    clients = session.query(Client).all()
    return jsonify([{
        'id': client.id,
        'name': client.name,
        'email': client.email,
        'phone': client.phone,
        'address': client.address
    } for client in clients])

@app.route('/api/clients', methods=['POST'])
def create_client():
    data = request.json
    session = Session()
    new_client = Client(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', ''),
        address=data.get('address', '')
    )
    session.add(new_client)
    try:
        session.commit()
        return jsonify({
            'id': new_client.id,
            'name': new_client.name,
            'email': new_client.email,
            'phone': new_client.phone,
            'address': new_client.address
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    data = request.json
    session = Session()
    client = session.query(Client).get(client_id)
    if client:
        client.name = data.get('name', client.name)
        client.email = data.get('email', client.email)
        client.phone = data.get('phone', client.phone)
        client.address = data.get('address', client.address)
        try:
            session.commit()
            return jsonify({
                'id': client.id,
                'name': client.name,
                'email': client.email,
                'phone': client.phone,
                'address': client.address
            })
        except Exception as e:
            session.rollback()
            return jsonify({'error': str(e)}), 400
    return jsonify({'error': 'Client not found'}), 404

@app.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    session = Session()
    client = session.query(Client).get(client_id)
    if client:
        session.delete(client)
        session.commit()
        return '', 204
    return jsonify({'error': 'Client not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port= 7777)

    