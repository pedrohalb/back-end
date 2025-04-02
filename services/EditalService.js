const EditalModel = require('../models/EditalModel');

const EditalService = {
  // Adicionar um novo edital
  addEdital: async (nome, status = 0) => {
    return await EditalModel.addEdital(nome, status);
  },

  // Associar matérias ao edital
  async addMateriasToEdital(editalId, materiaIds) {
    if (!editalId || !materiaIds || !Array.isArray(materiaIds) || materiaIds.length === 0) {
      throw new Error('Dados inválidos para associar matérias ao edital.');
    }

    try {
      await EditalModel.addMateriasToEdital(editalId, materiaIds);
      return { message: 'Matérias adicionadas com sucesso ao edital.' };
    } catch (error) {
      throw new Error('Erro ao associar matérias ao edital: ' + error.message);
    }
  },

  // Obter todos os editais com opção de exibir os excluídos
  getEditais: async (page, limit, search, sort, order, status, showDeleted = false) => {
    return await EditalModel.getEditais(page, limit, search, sort, order, status, showDeleted);
  },

  // Obter um edital específico por ID
  getEditalById: async (id) => {
    return await EditalModel.getEditalById(id);
  },

  // Obter as matérias associadas a um edital
getMateriasByEditalId: async (editalId, page, limit) => {
  // Valores padrão para os parâmetros caso não sejam fornecidos
  const pageInt = page ? parseInt(page, 10) : 1;
  const limitInt = limit ? parseInt(limit, 10) : 10;

  return await EditalModel.getMateriasByEditalId(editalId, pageInt, limitInt);
},



  // Atualizar um edital existente
  updateEdital: async (id, nome, status) => {
    return await EditalModel.updateEdital(id, nome, status);
  },

  // Alterar o status (ativo/inativo) de um edital
  toggleStatus: async (id, status) => {
    return await EditalModel.toggleStatus(id, status);
  },

  // Excluir um edital (soft delete)
  softDeleteEdital: async (id) => {
    const result = await EditalModel.softDeleteEdital(id);
    if (!result) {
      throw new Error('Falha ao excluir o edital.');
    }
    return { message: 'Edital marcado como excluído com sucesso!' };
  },

  // Restaurar um edital excluído
  restoreEdital: async (id) => {
    const result = await EditalModel.restoreEdital(id);
    if (!result) {
      throw new Error('Falha ao restaurar o edital.');
    }
    return { message: 'Edital restaurado com sucesso!' };
  },

  // Remover uma matéria de um edital
  removeMateriaFromEdital: async (editalId, materiaId) => {
    const result = await EditalModel.removeMateriaFromEdital(editalId, materiaId);
    if (!result) {
      throw new Error('Falha ao remover a matéria do edital.');
    }
    return { message: 'Matéria removida do edital com sucesso!' };
  },
};

module.exports = EditalService;
