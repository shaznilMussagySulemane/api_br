const express = require('express');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();
const path = require('path');
app.use(express.json());

mongoose.connect('mongodb+srv://shaznilmussagysulemane:Sm030106@verso.pt3ib.mongodb.net/?retryWrites=true&w=majority&appName=Verso', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

const inscricaoSchema = new mongoose.Schema({
    nome: String,
    apelido: String,
    nomeCracha: String,
    cpf: { type: String, unique: true },
    email: { type: String, unique: true },
    telefone: String,
    senha: String,
    municipioEstado: String,
    segrehEntidade: String,
    nomeComite: String,
    autorizoLGPD: Boolean,
}, { timestamps: true });

inscricaoSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

const Inscricao = mongoose.model('Inscricao', inscricaoSchema);

app.post('/api/inscricoes', async(req, res) => {
    const { nome, apelido, nomeCracha, cpf, email, telefone, senha, municipioEstado, segrehEntidade, nomeComite, autorizoLGPD } = req.body;

    console.log("Signup", req.body);
    
    try {
        const novaInscricao = new Inscricao({
            nome,
            apelido,
            nomeCracha,
            cpf,
            email,
            telefone,
            senha,
            municipioEstado,
            segrehEntidade,
            autorizoLGPD
        });

        await novaInscricao.save();
        res.status(201).json({ message: 'Inscrição criada com sucesso!', code: 100 });
    } catch (error) {
        if (error.code === 11000) {
            res.status(200).json({ error: 'CPF ou Email já cadastrado', code: 101 });
        } else {
            res.status(500).json({ error: 'Erro ao criar inscrição' });
        }
    }
});


app.post('/api/login', async(req, res) => {
    const { email, senha } = req.body;
    console.log("Login");
    try {
        const usuario = await Inscricao.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado', code: 201 });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta', code: 200 });

        const token = jwt.sign({ id: usuario._id, email: usuario.email },
            'seu_segredo_jwt', { expiresIn: '1h' }
        );
        res.status(200).json({ message: 'Login bem-sucedido', token, code: 102 });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

function autenticarToken(req, res, next) {
    // const token = req.header('Authorization') ? .replace('Bearer ', '');
    // const token = req.header('Authorization') ? .replace('Bearer ', '');
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return res.status(401).json({ error: 'Acesso negado' });

    try {
        const decoded = jwt.verify(token, 'seu_segredo_jwt');
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido' });
    }
}

app.get('/api/inscricoes', autenticarToken, async(req, res) => {
    try {
        const inscricoes = await Inscricao.find();
        res.status(200).json(inscricoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});
app.get('/', (req, res) => {
    res.send("Servidor ligado")
})
app.post('/api/certificado', (req, res) => {
    const { nome, apelido, id } = req.body;

    if (!nome || !apelido || !id) {
        return res.status(400).json({ error: "Nome, apelido e ID são obrigatórios" });
    }

    const doc = new PDFDocument();
    const nomeArquivo = `certificado_${id}.pdf`;
    const caminhoArquivo = path.join(__dirname, nomeArquivo);

    doc.pipe(fs.createWriteStream(caminhoArquivo));

    doc.fontSize(25).text("Certificado de Participação", { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Nome: ${nome}`, { align: 'center' });
    doc.text(`Apelido: ${apelido}`, { align: 'center' });
    doc.text(`ID do Participante: ${id}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text("Este certificado é um reconhecimento pela sua participação.", { align: 'center' });

    doc.end();

    doc.on('end', () => {
        res.download(caminhoArquivo, nomeArquivo, (err) => {
            if (err) {
                console.error("Erro ao enviar o arquivo:", err);
                res.status(500).send("Erro ao gerar o certificado.");
            }
            fs.unlinkSync(caminhoArquivo);
        });
    });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
//app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));