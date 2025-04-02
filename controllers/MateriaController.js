const MateriaService = require('../services/MateriaService');

const MateriaController = {
  addMateria: async (req, res) => {
    const { nome, status = 0 } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'Nome da matéria é obrigatório.' });
    }

    try {
      const materia = await MateriaService.addMateria(nome, status);
      res.status(201).json(materia);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao adicionar matéria.', error: err.message });
    }
  },

  getMaterias: async (req, res) => {
    const { page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false } = req.query;

    try {
      const result = await MateriaService.getMaterias(page, limit, search, sort, order, status, showDeleted === 'true');
      res.json(result);
    } catch (err) {
      console.error('Erro ao buscar matérias:', err);
      res.status(500).json({ message: 'Erro ao buscar matérias.', error: err.message });
    }
  },
  
getMateriasForModal: async (req, res) => {
    const { page = 1, limit = 5, search = '', sort = 'id', order = 'ASC'} = req.query;

    try {
        const result = await MateriaService.getMateriasForModal(page, limit, search, sort, order);
        console.log("Matérias retornadas para o modal:", result.items); // 🔍 Depuração
        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar matérias:', err);
        res.status(500).json({ message: 'Erro ao buscar matérias.', error: err.message });
    }
},


  getMateriaById: async (req, res) => {
    const { id } = req.params;
    const { showDeleted = false } = req.query;
    try {
      const materia = await MateriaService.getMateriaById(id, showDeleted === 'true');
      if (materia) {
        res.json(materia);
      } else {
        res.status(404).json({ message: 'Matéria não encontrada.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar matéria.', error: err.message });
    }
  },

  getTopicosByMateria2: async (req, res) => {
    const { id } = req.params;
    const { editalId } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'O ID da matéria é obrigatório.' });
    }

    try {
      const topicos = await MateriaService.getTopicosByMateria2(id, editalId || null);

      if (!topicos) {
        return res.status(404).json({ message: 'Nenhum tópico encontrado para essa matéria.' });
      }

      res.json({
        totalDisponiveis: topicos.totalDisponiveis || 0,
        totalAtivos: topicos.totalAtivos || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar tópicos da matéria:', error.message);
      res.status(500).json({ message: 'Erro ao buscar tópicos da matéria.', error: error.message });
    }
  },
  
    getEditaisByMateriaId: async (req, res) => {
    const { id } = req.params;
    try {
      const editais = await MateriaService.getEditaisByMateriaId(id);
      res.json({ editais });
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar editais associados à matéria.', error: err.message });
    }
  },

  updateMateria: async (req, res) => {
    const { id } = req.params;
    const { nome, status } = req.body;

    if (!nome || status === undefined) {
      return res.status(400).json({ message: 'Nome e status são obrigatórios.' });
    }

    try {
      const wasUpdated = await MateriaService.updateMateria(id, nome, status);
      if (wasUpdated) {
        res.json({ message: 'Matéria atualizada com sucesso.' });
      } else {
        res.status(404).json({ message: 'Matéria não encontrada.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar matéria.', error: err.message });
    }
  },

  toggleStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const wasUpdated = await MateriaService.toggleStatus(id, status);
      if (wasUpdated) {
        res.json({ message: 'Status da matéria atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Matéria não encontrada.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar status da matéria.', error: err.message });
    }
  },

  // Exclusão suave (soft delete)
  softDeleteMateria: async (req, res) => {
    const { id } = req.params;
    try {
      const wasDeleted = await MateriaService.softDeleteMateria(id);
      if (wasDeleted) {
        res.json({ message: 'Matéria excluída com sucesso.' });
      } else {
        res.status(404).json({ message: 'Matéria não encontrada.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao excluir matéria.', error: err.message });
    }
  },

  // Restauração de matéria excluída
  restoreMateria: async (req, res) => {
    const { id } = req.params;
    try {
      const wasRestored = await MateriaService.restoreMateria(id);
      if (wasRestored) {
        res.json({ message: 'Matéria restaurada com sucesso.' });
      } else {
        res.status(404).json({ message: 'Matéria não encontrada.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao restaurar matéria.', error: err.message });
    }
  }
};

module.exports = MateriaController;
