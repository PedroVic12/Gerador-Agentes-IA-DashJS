import sqlite3 as con
from datetime import datetime


class Database:
    def __init__(self, db_name="floricultura.db"):
        self.db_name = db_name
        self.conexao = None

    def connect(self):
        self.conexao = con.connect(self.db_name)
        return self.conexao.cursor()

    def close(self):
        if self.conexao:
            self.conexao.close()

    def commit(self):
        if self.conexao:
            self.conexao.commit()


class Cliente:
    def __init__(self, rg, nome, sobrenome, telefone, rua, numero, bairro):
        self.rg = rg
        self.nome = nome
        self.sobrenome = sobrenome
        self.telefone = telefone
        self.rua = rua
        self.numero = numero
        self.bairro = bairro

    def save(self, db):
        cursor = db.connect()
        cursor.execute(
            """
            INSERT INTO Cliente (RG, Nome_Cliente, Sobrenome_Cliente, Telefone, Rua, Numero, Bairro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                self.rg,
                self.nome,
                self.sobrenome,
                self.telefone,
                self.rua,
                self.numero,
                self.bairro,
            ),
        )
        db.commit()
        db.close()


class Produto:
    def __init__(self, nome, tipo, preco, qtde_estoque):
        self.nome = nome
        self.tipo = tipo
        self.preco = preco
        self.qtde_estoque = qtde_estoque

    def save(self, db):
        cursor = db.connect()
        cursor.execute(
            """
            INSERT INTO Produto (Nome_Produto, Tipo_Produto, Preco, Qtde_Estoque)
            VALUES (?, ?, ?, ?)
        """,
            (self.nome, self.tipo, self.preco, self.qtde_estoque),
        )
        db.commit()
        db.close()


class Venda:
    def __init__(self, nota_fiscal, id_cliente, data_compra, id_produto, quantidade):
        self.nota_fiscal = nota_fiscal
        self.id_cliente = id_cliente
        self.data_compra = data_compra
        self.id_produto = id_produto
        self.quantidade = quantidade

    def save(self, db):
        cursor = db.connect()
        cursor.execute(
            """
            INSERT INTO Venda (Nota_Fiscal, ID_Cliente, Data_Compra, ID_Produto, Quantidade)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                self.nota_fiscal,
                self.id_cliente,
                self.data_compra,
                self.id_produto,
                self.quantidade,
            ),
        )
        db.commit()
        db.close()


# Função para criar tabelas
def create_tables():
    db = Database()
    cursor = db.connect()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Cliente (
            ID_Cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            RG VARCHAR (12) NOT NULL,
            Nome_Cliente VARCHAR(30) NOT NULL,
            Sobrenome_Cliente VARCHAR(40),
            Telefone VARCHAR(12),
            Rua VARCHAR(40),
            Numero VARCHAR(5),
            Bairro VARCHAR(25)
        );
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Produto (
            ID_Produto INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome_Produto VARCHAR (30) NOT NULL,
            Tipo_Produto VARCHAR (25) NOT NULL,
            Preco DECIMAL(10,2) NOT NULL,
            Qtde_Estoque SMALLINT NOT NULL
        );
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Venda (
            ID_Transacao INTEGER PRIMARY KEY AUTOINCREMENT,
            Nota_Fiscal SMALLINT NOT NULL,
            ID_Cliente INTEGER NOT NULL,
            Data_Compra DATETIME,
            ID_Produto INTEGER NOT NULL,
            Quantidade SMALLINT NOT NULL,
            FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID_Cliente),
            FOREIGN KEY (ID_Produto) REFERENCES Produto(ID_Produto)
        );
    """
    )

    db.commit()
    db.close()


# Exemplo de uso
create_tables()

# Adicionar clientes
cliente1 = Cliente(
    "265356325",
    "Fábio",
    "dos Reis",
    "1156326356",
    "Rua do Orfanato",
    "235",
    "Vila Prudente",
)
cliente1.save(Database())

# Adicionar produtos
produto1 = Produto("Orquídea", "Flor", 55.50, 25)
produto1.save(Database())

# Adicionar vendas
venda1 = Venda(123, 1, "2024-04-04", 1, 3)
venda1.save(Database())
