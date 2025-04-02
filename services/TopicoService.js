const TopicoModel = require('../models/TopicoModel');

const TopicoService = {
  addTopico: async (nome, materia_id, status) => {
    return await TopicoModel.addTopico(nome, materia_id, status);
  },


  getTopicos: async (sort, order) => {
    return await TopicoModel.getTopicos(sort, order);
  },

  getTopicosByMateria: async (materiaId, page, limit, search, sort, order, status, editalId = null) => {
    return await TopicoModel.getTopicosByMateria(materiaId, page, limit, search, sort, order, status, editalId);
  },


  getTotalTopicosByMateria: async (materiaId, editalId = null) => {
    return await TopicoModel.getTotalTopicosByMateria(materiaId, editalId);
  },


  getTopicoById: async (id) => {
    return await TopicoModel.getTopicos(id);
  },

  updateTopico: async (id, data) => {
    return await TopicoModel.updateTopico(id, data);
  },

  updateTopicoStatus: async (id, status, editalId = null) => {
    if (editalId) {
      // Verifica se o tópico pertence ao edital específico
      const pertenceAoEdital = await TopicoModel.isTopicoInEdital(id, editalId);
      if (pertenceAoEdital) {
        // Atualiza status no edital específico
        return await TopicoModel.updateTopicoStatus(id, status, editalId);
      } else {
        // Caso o tópico não esteja vinculado ao edital, cria um novo vínculo
        return await TopicoModel.updateTopicoStatus(id, status, editalId);
      }
    } else {
      // Verifica se o tópico pertence a algum edital
      const pertenceAAlgumEdital = await TopicoModel.isTopicoInAnyEdital(id);

      if (pertenceAAlgumEdital) {
        throw new Error('O tópico pertence a um edital, forneça o ID do edital para atualizar o status.');
      } else {
        // Atualiza o status global, pois não há vínculo com edital
        return await TopicoModel.updateTopicoStatus(id, status);
      }
    }
  },



  toggleStatus: async (id, status) => {
    return await TopicoModel.toggleStatus(id, status);
  },

  deleteTopico: async (id) => {
    return await TopicoModel.deleteTopico(id);
  }
};

module.exports = TopicoService;