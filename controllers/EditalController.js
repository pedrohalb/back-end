const EditalService = require('../services/EditalService');

const EditalController = {
  // Adicionar novo edital
  addEdital: async (req, res) => {
    const { nome, status = 0 } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'Nome do edital é obrigatório.' });
    }
    try {
      const edital = await EditalService.addEdital(nome, status);
      res.status(201).json(edital);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao adicionar edital.', error: err.message });
    }
  },

  // Adicionar matérias a um edital
  addMateriasToEdital: async (req, res) => {
    const { id } = req.params; // ID do edital
    const { materias } = req.body; // IDs das matérias

    // Validação dos dados recebidos
    if (!materias || !Array.isArray(materias) || materias.length === 0) {
      return res.status(400).json({ message: 'Matérias inválidas ou ausentes.' });
    }

    try {
      await EditalService.addMateriasToEdital(id, materias);
      res.status(200).json({ message: 'Matérias associadas com sucesso ao edital.' });
    } catch (error) {
      console.error('Erro ao associar matérias ao edital:', error);
      res.status(500).json({
        message: 'Erro ao associar matérias ao edital.',
        error: error.message,
      });
    }
  },

  // Obter editais com opção de incluir excluídos
  getEditais: async (req, res) => {
    const { page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false } = req.query;
    try {
      const editais = await EditalService.getEditais(page, limit, search, sort, order, status, showDeleted == "true");
      res.json(editais);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar editais.', error: err.message });
    }
  },

  // Obter um edital específico por ID com opção de incluir excluídos
  getEditalById: async (req, res) => {
    const { id } = req.params;
    try {
      const edital = await EditalService.getEditalById(id);
      if (edital) {
        res.json(edital);
      } else {
        res.status(404).json({ message: 'Edital não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar edital.', error: err.message });
    }
  },

  // Obter matérias associadas ao edital
getMateriasByEditalId: async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Verificação de valores de entrada
  const pageInt = parseInt(page, 10) || 1;
  const limitInt = parseInt(limit, 10) || 10;

  if (!id) {
    return res.status(400).json({ message: 'O ID do edital é obrigatório.' });
  }

  try {
    const materias = await EditalService.getMateriasByEditalId(id, pageInt, limitInt);
    res.json(materias);
  } catch (err) {
    console.error('Erro ao buscar matérias do edital:', err);
    res.status(500).json({ message: 'Erro ao buscar matérias do edital.', error: err.message });
  }
},



  // Atualizar edital
  updateEdital: async (req, res) => {
    const { id } = req.params;
    const { nome, status } = req.body;
    if (!nome || status === undefined) {
      return res.status(400).json({ message: 'Nome e status são obrigatórios.' });
    }
    try {
      const wasUpdated = await EditalService.updateEdital(id, nome, status);
      if (wasUpdated) {
        res.json({ message: 'Edital atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Edital não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar edital.', error: err.message });
    }
  },

  // Alterar status de um edital (ativo/inativo)
  toggleStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const wasUpdated = await EditalService.toggleStatus(id, status);
      if (wasUpdated) {
        res.json({ message: 'Status do edital atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Edital não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar status do edital.', error: err.message });
    }
  },

  // Excluir edital (soft delete)
  softDeleteEdital: async (req, res) => {
    const { id } = req.params;
    try {
      const response = await EditalService.softDeleteEdital(id);
      res.json(response);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao excluir edital.', error: err.message });
    }
  },

  // Restaurar edital excluído
  restoreEdital: async (req, res) => {
    const { id } = req.params;
    try {
      const response = await EditalService.restoreEdital(id);
      res.json(response);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao restaurar edital.', error: err.message });
    }
  },

  // Remover matéria de um edital
  removeMateriaFromEdital: async (req, res) => {
    const { editalId, materiaId } = req.params;
    try {
      const wasDeleted = await EditalService.removeMateriaFromEdital(editalId, materiaId);
      if (wasDeleted) {
        res.json({ message: 'Matéria removida do edital com sucesso.' });
      } else {
        res.status(404).json({ message: 'Matéria ou edital não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao remover matéria do edital.', error: err.message });
    }
  },
};

module.exports = EditalController;
