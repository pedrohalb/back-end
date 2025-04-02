const MateriaModel = require('../models/MateriaModel');

const MateriaService = {
  addMateria: async (nome, status = 0) => {
    return await MateriaModel.addMateria(nome, status);
  },

 getMaterias: async (page, limit, search, sort, order, status, showDeleted = false) => {
    return await MateriaModel.getMaterias(page, limit, search, sort, order, status, showDeleted);
  },

  getMateriasForModal: async (page, limit, search, sort, order) => {
    return await MateriaModel.getMateriasForModal(page, limit, search, sort, order);
  },

  getMateriaById: async (id, showDeleted = false) => {
    return await MateriaModel.getMateriaById(id, showDeleted);
  },

  getTopicosByMateria2: async (materiaId, editalId = null) => {
    return await MateriaModel.getTopicosByMateria2(materiaId, editalId);
  },
  
    getEditaisByMateriaId: async (materiaId) => {
    return await MateriaModel.getEditaisByMateriaId(materiaId);
  },

  updateMateria: async (id, nome, status) => {
    return await MateriaModel.updateMateria(id, nome, status);
  },

  toggleStatus: async (id, status) => {
    return await MateriaModel.toggleStatus(id, status);
  },

  // Exclusão suave (soft delete)
  softDeleteMateria: async (id) => {
    return await MateriaModel.softDeleteMateria(id);
  },

  // Restauração de matéria excluída
  restoreMateria: async (id) => {
    return await MateriaModel.restoreMateria(id);
  }
};

module.exports = MateriaService;
