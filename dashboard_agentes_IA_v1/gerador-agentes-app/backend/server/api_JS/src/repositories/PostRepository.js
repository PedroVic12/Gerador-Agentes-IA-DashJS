import { ObjectId } from 'mongodb';

class PostRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
        this.dbName = "imersao-alura";
        this.collectionName = "posts";
    }

    async findAll() {
        try {
            const db = this.dbClient.db(this.dbName);
            const collection = db.collection(this.collectionName);
            return await collection.find().toArray();
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw new Error("Failed to fetch posts");
        }
    }

    async findById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error("Invalid post ID");
            }
            const db = this.dbClient.db(this.dbName);
            const collection = db.collection(this.collectionName);
            const post = await collection.findOne({ _id: new ObjectId(id) });
            if (!post) {
                throw new Error("Post not found");
            }
            return post;
        } catch (error) {
            console.error(`Error fetching post with id ${id}:`, error);
            throw error;
        }
    }

    async create(post) {
        try {
            if (!post.descricao || !post.imagemUrl) {
                throw new Error("Descricao e imagemUrl são obrigatórios");
            }

            const db = this.dbClient.db(this.dbName);
            const collection = db.collection(this.collectionName);
            
            const newPost = {
                descricao: post.descricao,
                imagemUrl: post.imagemUrl,
                classificacao: post.classificacao || 0,
                createdAt: new Date()
            };

            const result = await collection.insertOne(newPost);
            return { ...newPost, _id: result.insertedId };
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    }

    async update(id, post) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error("Invalid post ID");
            }

            if (!post.descricao || !post.imagemUrl) {
                throw new Error("Descricao e imagemUrl são obrigatórios");
            }

            const db = this.dbClient.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const updateData = {
                descricao: post.descricao,
                imagemUrl: post.imagemUrl,
                classificacao: post.classificacao || 0,
                updatedAt: new Date()
            };

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                throw new Error("Post not found");
            }

            return result.value;
        } catch (error) {
            console.error(`Error updating post with id ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error("Invalid post ID");
            }

            const db = this.dbClient.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

            if (!result.value) {
                throw new Error("Post not found");
            }

            return result.value;
        } catch (error) {
            console.error(`Error deleting post with id ${id}:`, error);
            throw error;
        }
    }
}

export default PostRepository;
