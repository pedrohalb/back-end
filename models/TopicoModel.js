const db = require('../config/db');

const TopicoModel = {
  addTopico: async (nome, materia_id, status) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Inserir novo tópico
      const [result] = await connection.execute(
        'INSERT INTO topicos (nome, materia_id, status) VALUES (?, ?, ?)',
        [nome, materia_id, status]
      );
      const topicoId = result.insertId;

      // Verificar se a matéria pertence a algum edital
      const [editaisMaterias] = await connection.execute(
        'SELECT edital_id FROM editais_materias WHERE materia_id = ?',
        [materia_id]
      );

      if (editaisMaterias.length > 0) {
        const values = editaisMaterias.map(({ edital_id }) => [edital_id, topicoId, status]);
        await connection.query(
          'INSERT INTO editais_topicos (edital_id, topico_id, status) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      return { id: topicoId, nome, materia_id, status };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  addArquivosAoTopico: async (topicoId, arquivos) => {
    const arquivoIds = [];
    for (const arquivo of arquivos) {
      const [result] = await db.execute(
        'INSERT INTO arquivos (nome, caminho) VALUES (?, ?)',
        [arquivo.nome, arquivo.caminho]
      );
      arquivoIds.push(result.insertId);
    }

    const values = arquivoIds.map((id) => `(${topicoId}, ${id})`).join(',');
    await db.execute(`INSERT INTO topicos_arquivos (topico_id, arquivo_id) VALUES ${values}`);
  },

  getTopicos: async (sort = 'id', order = 'ASC') => {
    const validSortFields = ['id', 'nome', 'created_at', 'updated_at'];
    const validOrder = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort)) sort = 'id';
    if (!validOrder.includes(order.toUpperCase())) order = 'ASC';

    const query = `SELECT * FROM topicos ORDER BY ${sort} ${order}`;
    const [topicos] = await db.execute(query);
    return topicos;
  },

  getTopicosByMateria: async (materiaId, page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, editalId = null) => {
    const validSortFields = ['id', 'nome', 'status', 'created_at', 'updated_at'];
    const validOrderOptions = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort)) sort = 'id';
    if (!validOrderOptions.includes(order.toUpperCase())) order = 'ASC';

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 5;
    const offset = (pageInt - 1) * limitInt;

    let query = `
    SELECT 
      t.id, 
      t.nome, 
      COALESCE(et.status, t.status) AS status, 
      t.created_at, 
      t.updated_at, 
      COUNT(DISTINCT ta.id) AS numero_arquivos
    FROM 
      topicos t
    LEFT JOIN 
      topicos_arquivos ta ON t.id = ta.topico_id
    LEFT JOIN 
      editais_materias em ON t.materia_id = em.materia_id
    LEFT JOIN 
      editais_topicos et 
    ON 
      t.id = et.topico_id AND et.edital_id = ?
    WHERE 
      t.materia_id = ?
  `;


    const params = [editalId, materiaId];

    if (search) {
      query += ' AND t.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== null) {
      query += ' AND COALESCE(et.status, t.status) = ?';
      params.push(status);
    }

    query += `
    GROUP BY t.id, t.nome, t.created_at, t.updated_at, et.status
    ORDER BY ${sort} ${order}
    LIMIT ${limitInt} OFFSET ${offset}
  `;


    const [topicos] = await db.execute(query, params);

    const countQuery = `
      SELECT COUNT(DISTINCT t.id) AS count 
      FROM topicos t
      LEFT JOIN editais_topicos et ON t.id = et.topico_id AND et.edital_id = ?
      WHERE t.materia_id = ?
      ${search ? ' AND t.nome LIKE ?' : ''} 
      ${status !== null ? ' AND COALESCE(et.status, t.status) = ?' : ''}
    `;

    const countParams = [editalId, materiaId];
    if (search) countParams.push(`%${search}%`);
    if (status !== null) countParams.push(status);

    const [[{ count }]] = await db.execute(countQuery, countParams);

    return {
      totalItems: count,
      currentPage: pageInt,
      totalPages: Math.ceil(count / limitInt),
      items: topicos,
    };
  },



  getTotalTopicosByMateria: async (materiaId, editalId = null) => {
    const query = `
      SELECT 
        COUNT(DISTINCT t.id) AS totalDisponiveis,
        COUNT(DISTINCT CASE WHEN et.status = 1 THEN t.id END) AS totalAtivos
      FROM topicos t
      LEFT JOIN editais_topicos et 
        ON t.id = et.topico_id 
        ${editalId ? 'AND et.edital_id = ?' : ''}
      WHERE t.materia_id = ?
    `;

    const params = editalId ? [editalId, materiaId] : [materiaId];

    const [[result]] = await db.execute(query, params);

    return {
      totalDisponiveis: result.totalDisponiveis || 0,
      totalAtivos: result.totalAtivos || 0
    };
  },


  getTopicoById: async (id) => {

    const query = `
      SELECT 
        t.id, 
        t.nome, 
        t.status, 
        t.materia_id, 
        m.nome AS materia_nome, 
        a.id AS arquivo_id, 
        a.nome AS arquivo_nome, 
        a.caminho AS arquivo_caminho
      FROM 
        topicos t
      LEFT JOIN 
        materias m ON t.materia_id = m.id
      LEFT JOIN 
        topicos_arquivos ta ON t.id = ta.topico_id
      LEFT JOIN 
        arquivos a ON ta.arquivo_id = a.id
      WHERE 
        t.id = ?
    `;

    const [rows] = await db.execute(query, [Number(id)]); // Confirme que o ID é tratado como número

    if (rows.length === 0) return null;

    const topico = {
      id: rows[0].id,
      nome: rows[0].nome,
      status: rows[0].status,
      materia: {
        id: rows[0].materia_id,
        nome: rows[0].materia_nome,
      },
      arquivos: rows
        .filter((row) => row.arquivo_id)
        .map((row) => ({
          id: row.arquivo_id,
          nome: row.arquivo_nome,
          caminho: row.arquivo_caminho,
        })),
    };

    return topico;
  },

  updateTopico: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.nome) {
      fields.push('nome = ?');
      values.push(data.nome);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.materia_id) {
      fields.push('materia_id = ?');
      values.push(data.materia_id);
    }

    values.push(id);

    const query = `UPDATE topicos SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  },

  async isTopicoInEdital(topicoId, editalId) {
    const query = `
      SELECT COUNT(*) AS count
      FROM editais_materias em
      JOIN topicos t ON em.materia_id = t.materia_id
      WHERE t.id = ? AND em.edital_id = ?
    `;

    const [[{ count }]] = await db.execute(query, [topicoId, editalId]);
    return count > 0; // Retorna true se a matéria do tópico pertence ao edital
  },

  // Verifica se a matéria do tópico pertence a qualquer edital
  async isTopicoInAnyEdital(topicoId) {
    const query = `
      SELECT COUNT(*) AS count
      FROM editais_materias em
      JOIN topicos t ON em.materia_id = t.materia_id
      WHERE t.id = ?
    `;

    const [[{ count }]] = await db.execute(query, [topicoId]);
    return count > 0; // Retorna true se a matéria pertence a algum edital
  },

  // Atualiza o status do tópico considerando sua relação com editais
  async updateTopicoStatus(topicoId, status, editalId = null) {
    if (editalId) {
      // Verificar se o tópico pertence ao edital
      const pertenceAoEdital = await this.isTopicoInEdital(topicoId, editalId);

      if (!pertenceAoEdital) {
        throw new Error('O tópico não pertence ao edital informado.');
      }

      // Verificar se já existe uma relação na tabela editais_topicos
      const queryCheck = `SELECT COUNT(*) AS count FROM editais_topicos WHERE topico_id = ? AND edital_id = ?`;
      const [[{ count }]] = await db.execute(queryCheck, [topicoId, editalId]);

      if (count > 0) {
        // Atualiza o status existente na tabela editais_topicos
        const queryUpdate = `UPDATE editais_topicos SET status = ? WHERE topico_id = ? AND edital_id = ?`;
        const [result] = await db.execute(queryUpdate, [status, topicoId, editalId]);
        return result.affectedRows > 0;
      } else {
        // Insere um novo registro se a relação ainda não existe
        const queryInsert = `INSERT INTO editais_topicos (topico_id, edital_id, status) VALUES (?, ?, ?)`;
        const [result] = await db.execute(queryInsert, [topicoId, editalId, status]);
        return result.affectedRows > 0;
      }
    } else {
      // Caso não tenha editalId, verifica se o tópico pertence a algum edital
      const pertenceAAlgumEdital = await this.isTopicoInAnyEdital(topicoId);

      if (pertenceAAlgumEdital) {
        throw new Error('O tópico pertence a um edital, forneça o ID do edital para atualizar o status.');
      }

      // Atualiza o status na tabela global de tópicos
      const queryUpdateGlobal = `UPDATE topicos SET status = ? WHERE id = ?`;
      const [result] = await db.execute(queryUpdateGlobal, [status, topicoId]);
      return result.affectedRows > 0;
    }
  },

  async toggleStatus(topicoId, status, editalId = null) {
    return await TopicoModel.updateTopicoStatus(topicoId, status, editalId);
  },

  deleteTopico: async (id) => {
    const [result] = await db.execute('DELETE FROM topicos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = TopicoModel;