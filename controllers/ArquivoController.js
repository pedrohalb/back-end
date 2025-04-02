const ArquivoService = require('../services/ArquivoService');
const db = require('../config/db');

const ArquivoController = {
  addArquivo: async (req, res) => {

    // Normalizar e verificar topico_id
    const { topico_id, nomes } = req.body;
    const normalizedTopicoId = Array.isArray(topico_id) ? topico_id[0] : topico_id;

    if (!normalizedTopicoId || normalizedTopicoId === 'undefined') {
      return res.status(400).json({ message: 'O ID do tópico é obrigatório e não pode ser indefinido.' });
    }

    if (!Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    try {
      const arquivosSalvos = [];
      for (const [index, file] of req.files.entries()) {
        const nome = Array.isArray(nomes) ? nomes[index] : nomes || file.originalname;
        const tamanho = file.size;

        const arquivoSalvo = await ArquivoService.addArquivo(nome, file.path, tamanho, normalizedTopicoId);

        arquivosSalvos.push(arquivoSalvo);
      }


      res.status(201).json({
        message: 'Arquivos enviados com sucesso!',
        arquivos: arquivosSalvos,
        topico_id: normalizedTopicoId,
      });
    } catch (err) {
      console.error('Erro ao adicionar arquivo:', err);
      res.status(500).json({ message: 'Erro ao adicionar arquivo.', error: err.message });
    }
  },

  getArquivos: async (req, res) => {
    const { sort = 'id', order = 'ASC', topico_id } = req.query;

    try {
      const arquivos = await ArquivoService.getArquivos(sort, order, topico_id);
      res.json(arquivos);
    } catch (err) {
      console.error('Erro ao buscar arquivos:', err);
      res.status(500).json({ message: 'Erro ao buscar arquivos.', error: err.message });
    }
  },

  updateArquivo: async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    if (!id || !nome) {
      return res.status(400).json({ message: 'ID e nome são obrigatórios.' });
    }

    try {
      await ArquivoService.updateArquivo(id, nome);
      res.json({ message: 'Arquivo atualizado com sucesso.' });
    } catch (err) {
      console.error('Erro ao atualizar arquivo:', err);
      res.status(500).json({ message: 'Erro ao atualizar arquivo.', error: err.message });
    }
  },


  deleteArquivo: async (req, res) => {
    const { id } = req.params;
    try {
      const wasDeleted = await ArquivoService.deleteArquivo(id);
      if (wasDeleted) {
        res.json({ message: 'Arquivo excluído com sucesso.' });
      } else {
        res.status(404).json({ message: 'Arquivo não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao excluir arquivo.', error: err.message });
    }
  },
};

module.exports = ArquivoController;
