const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/governo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro de conexão:', err));

const InscricaoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    apelido: { type: String, required: true },
    nomeCracha: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    telefone: { type: String },
    senha: { type: String, required: true },
    municipioEstado: { type: String, required: true },
    segrehEntidade: { type: String, required: true },
    nomeComite: { type: String }, // Campo opcional
    autorizoLGPD: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

InscricaoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Criando o modelo
const Inscricao = mongoose.model('Inscricao', InscricaoSchema);

// Função para criar uma nova inscrição
async function criarInscricao(inscricaoData) {
    const novaInscricao = new Inscricao(inscricaoData);

    try {
        const resultado = await novaInscricao.save();
        console.log('Inscrição criada com sucesso:', resultado);
    } catch (error) {
        console.error('Erro ao criar Inscrição:', error.message);
    }
}

criarInscricao({
    nome: 'Venancio ',
    apelido: "Mondlne",
    nomeCracha: 'Mondlane',
    cpf: '123.654.789-00',
    email: 'seuemail@example.com',
    telefone: '12345-9876',
    senha: 'senhaSegura',
    municipioEstado: 'Cidade - Estado',
    segrehEntidade: 'Segurança da Entidade',
    nomeComite: 'Nome do Comitê',
    autorizoLGPD: true
});