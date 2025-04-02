const TopicoService = require('../services/TopicoService');

const TopicoController = {
  addTopico: async (req, res) => {
    const { nome, materia_id, status } = req.body;

    if (!nome || !materia_id) {
      return res.status(400).json({ message: 'Nome e ID da matéria são obrigatórios.' });
    }

    try {
      const topico = await TopicoService.addTopico(nome, materia_id, status);

      if (req.files && req.files.length > 0) {
        const arquivos = req.files.map((file) => ({
          nome: req.body[`arquivos[${file.fieldname.split('[')[1].split(']')[0]}][name]`],
          caminho: file.path,
        }));

        await TopicoService.addArquivosAoTopico(topico.id, arquivos);
      }

      res.status(201).json({ message: 'Tópico criado com sucesso!', topico });
    } catch (err) {
      res.status(500).json({ message: 'Erro ao adicionar tópico.', error: err.message });
    }
  },

  getTopicos: async (req, res) => {
    const { sort = 'id', order = 'ASC' } = req.query;
    try {
      const topicos = await TopicoService.getTopicos(sort, order);
      res.json(topicos);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar tópicos.', error: err.message });
    }
  },

  getTopicosByMateria: async (req, res) => {
    const { materiaId } = req.params;
    const {
      page = 1,
      limit = 5,
      search = '',
      sort = 'id',
      order = 'ASC',
      status = null,
      editalId = null
    } = req.query;

    try {
      const result = await TopicoService.getTopicosByMateria(materiaId, page, limit, search, sort, order, status, editalId);
      res.json(result);
    } catch (err) {
      console.error('Erro ao buscar tópicos por matéria:', err);
      res.status(500).json({ message: 'Erro ao buscar tópicos por matéria.', error: err.message });
    }
  },


  getTopicosByMateriaWithTotal: async (req, res) => {
    try {
      const { id: materiaId } = req.params;
      const { editalId } = req.query;

      if (!materiaId) {
        return res.status(400).json({ message: 'O ID da matéria é obrigatório.' });
      }

      const result = await TopicoService.getTotalTopicosByMateria(materiaId, editalId || null);
      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar total de tópicos:', error.message);
      res.status(500).json({ message: 'Erro ao buscar total de tópicos.', error: error.message });
    }
  },


  getTopicoById: async (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      console.error('ID inválido:', id);
      return res.status(400).json({ message: 'ID inválido.' });
    }

    try {
      const topico = await TopicoService.getTopicoById(id);
      if (!topico) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
      }
      res.json(topico);
    } catch (error) {
      console.error('Erro ao buscar tópico:', error.message);
      res.status(500).json({ message: 'Erro ao buscar tópico.', error: error.message });
    }
  },

  updateTopico: async (req, res) => {
    const { id } = req.params;
    const { nome, status, materia_id } = req.body;

    if (!nome && status === undefined && !materia_id) {
      return res.status(400).json({ message: 'Nenhuma alteração fornecida.' });
    }

    try {
      const wasUpdated = await TopicoService.updateTopico(id, { nome, status, materia_id });
      if (wasUpdated) {
        res.json({ message: 'Tópico atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Tópico não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error.message);
      res.status(500).json({ message: 'Erro ao atualizar tópico.', error: error.message });
    }
  },

  updateTopicoStatus: async (req, res) => {
    const { id } = req.params;
    const { status, editalId } = req.body;

    if (status === undefined) {
      return res.status(400).json({ message: 'Status é obrigatório.' });
    }

    try {
      const wasUpdated = await TopicoService.updateTopicoStatus(id, status, editalId);

      if (wasUpdated) {
        res.json({ message: 'Status do tópico atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Tópico não encontrado ou não vinculado ao edital informado.' });
      }
    } catch (error) {
      console.error('Erro ao atualizar status do tópico:', error.message);

      if (error.message.includes('forneça o ID do edital')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Erro ao atualizar status do tópico.', error: error.message });
    }
  },


  toggleStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status === undefined) {
      return res.status(400).json({ message: 'Status é obrigatório.' });
    }
    try {
      const wasUpdated = await TopicoService.toggleStatus(id, status);
      if (wasUpdated) {
        res.json({ message: 'Status do tópico atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Tópico não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao atualizar status do tópico.', error: err.message });
    }
  },

  deleteTopico: async (req, res) => {
    const { id } = req.params;
    try {
      const wasDeleted = await TopicoService.deleteTopico(id);
      if (wasDeleted) {
        res.json({ message: 'Tópico excluído com sucesso.' });
      } else {
        res.status(404).json({ message: 'Tópico não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao excluir tópico.', error: err.message });
    }
  },
};

module.exports = TopicoController;