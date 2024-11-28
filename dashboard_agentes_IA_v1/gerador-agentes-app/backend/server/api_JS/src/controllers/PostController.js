class PostController {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }

    async getAllPosts(req, res) {
        try {
            const posts = await this.postRepository.findAll();
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: "Error fetching posts" });
        }
    }

    async getPostById(req, res) {
        try {
            const post = await this.postRepository.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ error: "Error fetching post" });
        }
    }

    async createPost(req, res) {
        try {
            const { nome, descricao, img } = req.body;
            const post = { nome, descricao, img };
            const id = await this.postRepository.create(post);
            res.status(201).json({ id, ...post });
        } catch (error) {
            res.status(500).json({ error: "Error creating post" });
        }
    }
}

export default PostController;
