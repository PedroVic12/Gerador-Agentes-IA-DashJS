import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Conectar ao MongoDB
async function conectarMongoDB() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB!");
        return client.db("imersao-alura").collection("posts");
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        process.exit(1);
    }
}

// Rotas
async function configurarRotas(collection) {
    // GET /posts - Listar todos os posts
    app.get('/posts', async (req, res) => {
        try {
            const posts = await collection.find().toArray();
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar posts" });
        }
    });

    // GET /posts/:id - Buscar um post específico
    app.get('/posts/:id', async (req, res) => {
        try {
            const post = await collection.findOne({ _id: req.params.id });
            if (!post) {
                return res.status(404).json({ error: "Post não encontrado" });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar post" });
        }
    });

    // POST /posts - Criar novo post
    app.post('/posts', async (req, res) => {
        try {
            const { descricao, imagemUrl, classificacao } = req.body;
            
            // Validação básica
            if (!descricao || !imagemUrl) {
                return res.status(400).json({ error: "Descricao e imagemUrl são obrigatórios" });
            }

            const novoPost = {
                descricao,
                imagemUrl,
                classificacao: classificacao || 0,
                dataCriacao: new Date()
            };

            const resultado = await collection.insertOne(novoPost);
            res.status(201).json({ id: resultado.insertedId, ...novoPost });
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar post" });
        }
    });

    // PUT /posts/:id - Atualizar um post
    app.put('/posts/:id', async (req, res) => {
        try {
            const { descricao, imagemUrl, classificacao } = req.body;
            const resultado = await collection.updateOne(
                { _id: req.params.id },
                { $set: { descricao, imagemUrl, classificacao } }
            );

            if (resultado.matchedCount === 0) {
                return res.status(404).json({ error: "Post não encontrado" });
            }
            res.json({ message: "Post atualizado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar post" });
        }
    });

    // DELETE /posts/:id - Deletar um post
    app.delete('/posts/:id', async (req, res) => {
        try {
            const resultado = await collection.deleteOne({ _id: req.params.id });
            if (resultado.deletedCount === 0) {
                return res.status(404).json({ error: "Post não encontrado" });
            }
            res.json({ message: "Post deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar post" });
        }
    });
}

// Iniciar servidor
async function iniciarServidor() {
    const collection = await conectarMongoDB();
    await configurarRotas(collection);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

iniciarServidor().catch(console.error);
