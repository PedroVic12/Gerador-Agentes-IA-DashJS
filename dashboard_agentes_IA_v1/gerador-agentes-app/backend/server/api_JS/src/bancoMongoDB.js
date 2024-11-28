import MongoClient from "mongodb"

export default  function conectarBanco(strConexao) async { 
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