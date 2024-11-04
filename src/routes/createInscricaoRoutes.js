const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');

router.post('/inscricao', inscricaoController.criarInscricao);

module.exports = router;
