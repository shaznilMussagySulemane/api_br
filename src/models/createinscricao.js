const prisma = require('../config/db');

const createInscricao = async (data) => await prisma.inscricao.create({ data });
const getInscricoes = async () => await prisma.inscricao.findMany();
const getInscricaoById = async (id) => await prisma.inscricao.findUnique({ where: { id } });
const updateInscricao = async (id, data) => await prisma.inscricao.update({ where: { id }, data });
const deleteInscricao = async (id) => await prisma.inscricao.delete({ where: { id } });

module.exports = {
  createInscricao,
  getInscricoes,
  getInscricaoById,
  updateInscricao,
  deleteInscricao
};
