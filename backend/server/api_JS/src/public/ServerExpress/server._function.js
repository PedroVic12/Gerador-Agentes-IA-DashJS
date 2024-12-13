import express from "express"

import conectarBanco from "./bancoMongoDB"
import MongoClient from "mongodb"

const appExpress = express()

const routes = (appExpress)=>{
    
}

class Server{
    constructor(app){
        this.app = app
    }

    init(){
        this.app.listen(3000,()=>{
            console.log("Servidor escutando na porta localhost:3000")
        })
    }

    async conectarMongoDB(strConexao){
        //41:51 / 47:42 aula 02 alura com mongoDB
        let mongoClient;

        try {
            mongoClient = new MongoClient(strConexao)
            console.log("Conecatnado ao cluster do mongodb")
    
            await mongoClient.connect()
            console.log("Banco conectando")
    
            return mongoClient;
        }
    
        catch (erro){
            console.log("erro na conexao com o banco", erro)
            process.exit()
        }
    }

    buscarPostPorId(id,posts){
        return posts.findIndex((post) => {
            return post.id === Number(id)
        })
    }

    fetchAll(db_connection){
        let nomeBanco = "imersao-alura"
        let colecaoBanco = "posts"
        const db = db_connection.db(nomeBanco)
        const colecao = db.collection(colecaoBanco)

        return colecao.find().toArray()
    }

    setupRoutes(){
        // metodo separado em otro arquivo
        const dados = [
            {
                "nome:":"Foto",
                "descicrao": "uma foto teste",
                "img": "https://placecats.com/millie/300/150"
            },


        ]
        this.app.get("/api/posts", async (req,res) => {
            const posts = await this.fetchAll()
            res.status(200).send("Mensagem")
            res.status(200).json(dados)
        })

        this.app.get("/api/posts/:id", (req,res) => {
            const index = this.buscarPostPorId(req.params.id, dados)
            res.status(200).json(dados[index])
        })
    }
}


class ApiRest{

    // classe para fazer get e post com axios no meu servidor
    constructor(){

    }
}


async function run_server() {

    const conexao = await conectarBanco(process.env.str_conexao)
    let server = new Server(appExpress)

    server.init()
    server.setupRoutes()
}