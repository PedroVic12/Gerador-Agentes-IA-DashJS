## Como Trabalhar com Frontend React e Backend em Python com CRUD e SQLite

### Introdução

O desenvolvimento full-stack envolve trabalhar com o frontend e o backend de uma aplicação web. Este tutorial mostrará como integrar o React (frontend) com Python (backend), usando CRUD (Create, Read, Update, Delete) e SQLite (banco de dados).

### Configuração do Projeto

**Frontend React:**

- Instale o Node.js e o React CLI
- Crie um novo projeto React usando `create-react-app <nome_do_projeto>`
- Instale o Axios para gerenciar solicitações HTTP

**Backend Python:**

- Instale o Python 3.6 ou superior
- Crie um ambiente virtual e ative-o
- Instale o Flask, Flask-SQLAlchemy e SQLite

### Conectando ao Banco de Dados

**Backend Python:**

- Conecte-se ao banco de dados SQLite

```python
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
```

- Crie um modelo para representar os dados

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120), unique=True)
```

### Rotas CRUD

**Criar (Create):**

```python
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(name=data['name'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify({ 'success': True })
```

**Ler (Read):**

```python
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify({ 'users': [user.serialize for user in users] })
```

**Atualizar (Update):**

```python
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({ 'success': False, 'error': 'Usuário não encontrado' })
    data = request.get_json()
    user.name = data['name']
    user.email = data['email']
    db.session.commit()
    return jsonify({ 'success': True })
```

**Deletar (Delete):**

```python
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({ 'success': False, 'error': 'Usuário não encontrado' })
    db.session.delete(user)
    db.session.commit()
    return jsonify({ 'success': True })
```

### Integrando Frontend e Backend

**Solicitando Dados:**

No frontend, use Axios para enviar solicitações para o backend:

```javascript
import axios from 'axios';

const getUsers = async () => {
  const response = await axios.get('http://localhost:5000/users');
  return response.data.users;
};
```

**Enviando Dados:**

```javascript
const createUser = async (data) => {
  const response = await axios.post('http://localhost:5000/users', data);
  return response.data;
};
```

### Conclusão

Este tutorial demonstrou a integração de um frontend React com um backend Python usando CRUD e SQLite, capacitando você a criar aplicativos da web completos com separação clara de preocupações entre o frontend e o backend.