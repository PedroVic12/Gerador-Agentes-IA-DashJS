import express from 'express';
import DatabaseConnection from './config/database.js';
import PostRepository from './repositories/PostRepository.js';
import PostController from './controllers/PostController.js';
import PostRouter from './routes/postRoutes.js';

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
    }

    setupMiddleware() {
        this.app.use(express.json());
    }

    async setupDatabase(uri) {
        try {
            const dbConnection = new DatabaseConnection(uri);
            this.dbClient = await dbConnection.connect();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        }
    }

    setupRoutes() {
        const postRepository = new PostRepository(this.dbClient);
        const postController = new PostController(postRepository);
        const postRouter = new PostRouter(postController);

        this.app.use('/api', postRouter.getRouter());
    }

    start(port) {
        this.app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
}

export default App;
