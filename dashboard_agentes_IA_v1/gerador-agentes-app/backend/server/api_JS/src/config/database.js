import { MongoClient, ServerApiVersion } from 'mongodb';

class DatabaseConnection {
    constructor(uri) {
        this.uri = uri;
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    async connect() {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 });
            console.log("Successfully connected to MongoDB!");
            return this.client;
        } catch (error) {
            console.error("Error connecting to database:", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            console.log("Database connection closed");
        } catch (error) {
            console.error("Error disconnecting from database:", error);
            throw error;
        }
    }
}

export default DatabaseConnection;
