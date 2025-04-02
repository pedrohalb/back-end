const db = require('../config/db');

const EditalModel = {
  // Adicionar um novo edital
  addEdital: async (nome, status = 0) => {
    const [result] = await db.execute(
      'INSERT INTO editais (nome, status) VALUES (?, ?)',
      [nome, status]
    );
    return { id: result.insertId, nome, status };
  },

  addMateriasToEdital: async (editalId, materiaIds) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Adiciona as matérias ao edital
      const values = materiaIds.map((materiaId) => [editalId, materiaId]);
      const query = 'INSERT INTO editais_materias (edital_id, materia_id) VALUES ?';
      await connection.query(query, [values]);

      // Associa automaticamente os tópicos das matérias ao edital
      for (const materiaId of materiaIds) {
        const [topicos] = await connection.execute(
          'SELECT id, status FROM topicos WHERE materia_id = ?',
          [materiaId]
        );

        if (topicos.length > 0) {
          const topicoValues = topicos.map(({ id, status }) => [id, editalId, status]);
          const insertTopicosQuery = `
            INSERT INTO editais_topicos (topico_id, edital_id, status) 
            VALUES ?
            ON DUPLICATE KEY UPDATE status = VALUES(status)
          `;

          await connection.query(insertTopicosQuery, [topicoValues]);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao adicionar matérias e tópicos ao edital:', error);
      throw error;
    } finally {
      connection.release();
    }
  },


  getEditais: async (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false) => {
    const validSortFields = ['id', 'nome', 'status', 'created_at', 'updated_at'];
    const validOrderOptions = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort)) sort = 'id';
    if (!validOrderOptions.includes(order.toUpperCase())) order = 'ASC';

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 5;
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT 
        e.id, 
        e.nome, 
        e.status, 
        e.created_at, 
        e.updated_at, 
        e.deleted_at,
        (
          SELECT COUNT(*) 
          FROM editais_materias em 
          JOIN materias m ON em.materia_id = m.id 
          WHERE em.edital_id = e.id
        ) AS total_materias,  -- Total de matérias associadas ao edital
        (
          SELECT COUNT(*) 
          FROM editais_materias em 
          JOIN materias m ON em.materia_id = m.id 
          WHERE em.edital_id = e.id AND m.status = 1 AND m.deleted_at IS NULL
        ) AS total_materias_ativas,  -- Matérias ativas
        (
          SELECT COUNT(*) 
          FROM editais_materias em 
          JOIN materias m ON em.materia_id = m.id 
          WHERE em.edital_id = e.id AND m.status = 0 AND m.deleted_at IS NULL
        ) AS total_materias_inativas,  -- Matérias inativas
        (
          SELECT COUNT(*) 
          FROM editais_materias em 
          JOIN materias m ON em.materia_id = m.id 
          WHERE em.edital_id = e.id AND m.deleted_at IS NOT NULL
        ) AS total_materias_excluidas  -- Matérias excluídas
      FROM 
        editais e
      WHERE 1=1
    `;

    const params = [];

    // Filtro para excluir ou incluir registros deletados
    if (!showDeleted) {
      query += ' AND e.deleted_at IS NULL';  // Apenas não excluídos
    } else {
      query += ' AND e.deleted_at IS NOT NULL'; // Apenas os excluídos
    }

    if (search) {
      query += ' AND e.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== null) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += `
      GROUP BY e.id
      ORDER BY ${sort} ${order}
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    const [editais] = await db.execute(query, params);

    // Contagem total para paginação
    const countQuery = `
      SELECT COUNT(*) AS count 
      FROM editais 
      WHERE 1=1 
      ${!showDeleted ? ' AND deleted_at IS NULL' : ' AND deleted_at IS NOT NULL'}
      ${search ? ' AND nome LIKE ?' : ''} 
      ${status !== null ? ' AND status = ?' : ''}
    `;

    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (status !== null) countParams.push(status);

    const [[{ count }]] = await db.execute(countQuery, countParams);

    return {
      totalItems: count,
      currentPage: pageInt,
      totalPages: Math.ceil(count / limitInt),
      items: editais,
    };
},



  // Buscar um edital pelo ID, ignorando os excluídos
  getEditalById: async (id) => {
    const [edital] = await db.execute('SELECT * FROM editais WHERE id = ?', [id]);
    return edital[0]; // Retorna o primeiro registro
  },

  getMateriasByEditalId: async (editalId, page = 1, limit = 10, sort = 'created_at', order = 'ASC') => {
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    const query = 
      `SELECT 
        m.id, 
        m.nome, 
        m.status, 
        m.deleted_at,  -- Incluir informação de exclusão
        COUNT(t.id) AS numero_topicos
      FROM 
        editais_materias em
      JOIN 
        materias m ON em.materia_id = m.id
      LEFT JOIN 
        topicos t ON t.materia_id = m.id
      WHERE 
        em.edital_id = ? 
      GROUP BY 
        m.id, m.nome, m.status, em.created_at, m.deleted_at
      ORDER BY 
        em.created_at ASC
      LIMIT ? OFFSET ?`;

    const countQuery = 
      `SELECT COUNT(DISTINCT m.id) AS total
      FROM editais_materias em
      JOIN materias m ON em.materia_id = m.id
      WHERE em.edital_id = ?`;

    const [materias] = await db.execute(query, [editalId, limitInt, offset]);
    const [[{ total }]] = await db.execute(countQuery, [editalId]);

    return {
      totalItems: total,
      currentPage: pageInt,
      totalPages: Math.ceil(total / limitInt),
      items: materias.map((materia) => ({
        ...materia,
        isDeleted: materia.deleted_at !== null,  // Novo campo indicando exclusão
      })),
    };
  },

  // Atualizar um edital
  updateEdital: async (id, nome, status) => {
    const [result] = await db.execute(
      'UPDATE editais SET nome = ?, status = ? WHERE id = ?',
      [nome, status, id]
    );
    return result.affectedRows > 0;
  },

  // Alterar o status de um edital (ativo/inativo)
  toggleStatus: async (id, status) => {
    const [result] = await db.execute(
      'UPDATE editais SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  // Exclusão lógica de um edital (soft delete)
  softDeleteEdital: async (id) => {
    const [result] = await db.execute(
      'UPDATE editais SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Restaurar edital excluído
  restoreEdital: async (id) => {
    const [result] = await db.execute(
      'UPDATE editais SET deleted_at = NULL WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  removeMateriaFromEdital: async (editalId, materiaId) => {
    const query = `DELETE FROM editais_materias WHERE edital_id = ? AND materia_id = ?`;
    const [result] = await db.execute(query, [editalId, materiaId]);
    return result.affectedRows > 0;
  },
};

module.exports = EditalModel;
