const db = require('../config/db');

const ArquivoModel = {
  addArquivo: async (nome, caminho, size, topico_id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [arquivoResult] = await connection.execute(
        'INSERT INTO arquivos (nome, caminho, size) VALUES (?, ?, ?)',
        [nome, caminho, size]
      );

      const arquivoId = arquivoResult.insertId;

      await connection.execute(
        'INSERT INTO topicos_arquivos (topico_id, arquivo_id) VALUES (?, ?)',
        [topico_id, arquivoId]
      );

      await connection.commit();

      return { id: arquivoId, nome, caminho, size, topico_id };
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao inserir arquivo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  relateArquivoAoTopico: async (topico_id, arquivo_id) => {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO topicos_arquivos (topico_id, arquivo_id) VALUES (?, ?)',
        [topico_id, arquivo_id]
      );

      return result;
    } catch (error) {
      console.error('Erro ao relacionar arquivo ao tópico:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  getArquivos: async (sort = 'id', order = 'ASC', topico_id = null) => {
    let query = `
      SELECT a.id, a.nome, a.caminho, a.size, a.uploaded_at 
      FROM arquivos a
      INNER JOIN topicos_arquivos ta ON a.id = ta.arquivo_id
    `;
    const params = [];

    if (topico_id) {
      query += ' WHERE ta.topico_id = ?';
      params.push(topico_id);
    }

    query += ` ORDER BY ${sort} ${order}`;
    const [arquivos] = await db.execute(query, params);

    return arquivos;
  },

  updateArquivo: async (id, nome) => {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE arquivos SET nome = ? WHERE id = ?',
        [nome, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },


  deleteArquivo: async (id) => {
    const [result] = await db.execute('DELETE FROM arquivos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ArquivoModel;
