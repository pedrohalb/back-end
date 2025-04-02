const ArquivoModel = require('../models/ArquivoModel');

const ArquivoService = {
  addArquivo: async (nome, caminho, size, topico_id) => {

    if (!topico_id) {
      console.error('Erro: ID do tópico é obrigatório.');
      throw new Error('O ID do tópico é obrigatório para adicionar um arquivo.');
    }

    const resultado = await ArquivoModel.addArquivo(nome, caminho, size, topico_id);
    return resultado;
  },

  relateArquivoAoTopico: async (topico_id, arquivo_id) => {

    if (!topico_id || !arquivo_id) {
      throw new Error('Tópico ID e Arquivo ID são obrigatórios para relacionar.');
    }

    const resultado = await ArquivoModel.relateArquivoAoTopico(topico_id, arquivo_id);
    return resultado;
  },

  updateArquivo: async (id, nome) => {

    if (!id || !nome) {
      throw new Error('ID e nome são obrigatórios para atualizar o arquivo.');
    }

    const atualizado = await ArquivoModel.updateArquivo(id, nome);
    if (!atualizado) {
      throw new Error('Erro ao atualizar: Arquivo não encontrado ou já atualizado.');
    }

    return atualizado;
  },

  getArquivos: async (sort, order, topico_id) => {

    const resultado = await ArquivoModel.getArquivos(sort, order, topico_id);
    return resultado;
  },

  deleteArquivo: async (id) => {

    if (!id) {
      throw new Error('O ID do arquivo é obrigatório para exclusão.');
    }

    const wasDeleted = await ArquivoModel.deleteArquivo(id);
    if (!wasDeleted) {
      throw new Error('Erro ao excluir arquivo: Arquivo não encontrado.');
    }

    return wasDeleted;
  }
};

module.exports = ArquivoService;
