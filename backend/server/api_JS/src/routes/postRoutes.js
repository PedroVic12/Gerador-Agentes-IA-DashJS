import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Configure GridFS storage
const storage = new GridFsStorage({
    url: process.env.str_conexao,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: 'images',
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

const upload = multer({ storage });

export default function setupRoutes(db) {
    // Get all posts with images
    router.get('/', async (req, res) => {
        try {
            const posts = await db.collection('posts').find().toArray();
            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Get single post
    router.get('/:id', async (req, res) => {
        try {
            const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Create new post with image
    router.post('/', upload.single('image'), async (req, res) => {
        try {
            const { title, description } = req.body;
            const imageId = req.file.id;

            const post = {
                title,
                description,
                imageId,
                createdAt: new Date(),
                metadata: {
                    contentType: req.file.contentType,
                    size: req.file.size
                }
            };

            const result = await db.collection('posts').insertOne(post);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    // Get image by ID
    router.get('/image/:id', async (req, res) => {
        try {
            const bucket = new GridFSBucket(db, {
                bucketName: 'images'
            });

            const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
            downloadStream.pipe(res);
        } catch (error) {
            res.status(404).json({ message: 'Image not found' });
        }
    });

    // Analyze image
    router.post('/analyze/:id', async (req, res) => {
        try {
            const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Here you can add image analysis logic
            const analysis = {
                timestamp: new Date(),
                dimensions: post.metadata?.dimensions || 'unknown',
                format: post.metadata?.contentType || 'unknown',
                size: post.metadata?.size || 0,
                // Add more analysis data as needed
            };

            await db.collection('posts').updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { analysis } }
            );

            res.json(analysis);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
}
