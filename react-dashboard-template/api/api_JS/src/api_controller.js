async function buscarPostPorId(id,posts){
    return posts.findIndex((post) => {
        return post.id === Number(id)
    })
}

async function fetchAll(db_connection){
    let nomeBanco = "imersao-alura"
    let colecaoBanco = "posts"
    const db = db_connection.db(nomeBanco)
    const colecao = db.collection(colecaoBanco)

    return colecao.find().toArray()
}

async function listarPOsts(req,res) {
    const posts = await fetchAll()

    res.status(200).json(posts)
}