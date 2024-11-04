const express = require('express');
const app = express();
const inscricaoRoutes = require('./routes/createInscricaoRoutes');

app.use(express.json());
app.use('/api', inscricaoRoutes);

module.exports = app;