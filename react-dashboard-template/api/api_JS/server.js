import App from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
    const app = new App();
    const port = process.env.PORT || 3000;
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('MongoDB URI not found in environment variables');
        process.exit(1);
    }

    await app.setupDatabase(mongoUri);
    app.setupRoutes();
    app.start(port);
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});