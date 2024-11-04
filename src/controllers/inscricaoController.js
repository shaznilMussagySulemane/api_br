const inscricaoService = require('../models/createinscricao');

const criarInscricao = async(req, res) => {
    try {
        const inscricao = await inscricaoService.createInscricao(req.body);
        res.status(201).json(inscricao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar inscrição', error });
    }
};

module.exports = { criarInscricao };