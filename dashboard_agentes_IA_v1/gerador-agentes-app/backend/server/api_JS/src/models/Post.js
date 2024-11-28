class Post {
    constructor(nome, descricao, img) {
        this.nome = nome;
        this.descricao = descricao;
        this.img = img;
    }

    toJSON() {
        return {
            nome: this.nome,
            descricao: this.descricao,
            img: this.img
        };
    }
}

export default Post;
