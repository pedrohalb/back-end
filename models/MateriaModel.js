const db = require('../config/db');

const MateriaModel = {
  // Adicionar uma nova matéria
  addMateria: async (nome, status = 0) => {
    const [result] = await db.execute(
      'INSERT INTO materias (nome, status) VALUES (?, ?)',
      [nome, status]
    );
    return { id: result.insertId, nome, status };
  },

 // Buscar todas as matérias com filtros, incluindo itens excluídos logicamente
  getMaterias: async (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC', status = null, showDeleted = false) => {
    const validSortFields = ['id', 'nome', 'status', 'created_at', 'updated_at'];
    const validOrderOptions = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort)) sort = 'id';
    if (!validOrderOptions.includes(order.toUpperCase())) order = 'ASC';

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 5;
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT 
        m.id, 
        m.nome, 
        m.status, 
        m.created_at, 
        m.updated_at, 
        m.deleted_at,
        COUNT(t.id) AS numero_topicos,
        COUNT(CASE WHEN t.status = 1 THEN 1 END) AS numero_topicos_ativos,  -- Contagem de tópicos ativos
        COUNT(CASE WHEN t.status = 0 THEN 1 END) AS numero_topicos_inativos  -- Contagem de tópicos inativos
      FROM 
        materias m
      LEFT JOIN 
        topicos t
      ON 
        m.id = t.materia_id
      WHERE 1=1
    `;
    
    const params = [];

    if (!showDeleted) {
      query += ' AND m.deleted_at IS NULL';  // Apenas não excluídos
    } else {
      query += ' AND m.deleted_at IS NOT NULL'; // Apenas os excluídos
    }

    if (search) {
      query += ' AND m.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== null) {
      query += ' AND m.status = ?';
      params.push(status);
    }

    query += `
      GROUP BY m.id, m.nome, m.status, m.created_at, m.updated_at, m.deleted_at
      ORDER BY ${sort} ${order}
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    const [materias] = await db.execute(query, params);

    // Contagem total para paginação
    let countQuery = `
      SELECT COUNT(*) AS count 
      FROM materias 
      WHERE 1=1 
    `;

    if (!showDeleted) {
      countQuery += ' AND deleted_at IS NULL';
    } else {
      countQuery += ' AND deleted_at IS NOT NULL';
    }

    if (search) {
      countQuery += ' AND nome LIKE ?';
    }

    if (status !== null) {
      countQuery += ' AND status = ?';
    }

    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (status !== null) countParams.push(status);

    const [[{ count }]] = await db.execute(countQuery, countParams);

    return {
      totalItems: count,
      currentPage: pageInt,
      totalPages: count > 0 ? Math.ceil(count / limitInt) : 1, // Garante pelo menos 1 página
      items: materias,
    };
},



// Buscar todas as matérias para o modal, incluindo ativas e excluídas
getMateriasForModal: async (page = 1, limit = 5, search = '', sort = 'id', order = 'ASC') => {
    const validSortFields = ['id', 'nome', 'status', 'created_at', 'updated_at', 'deleted_at'];
    const validOrderOptions = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort)) sort = 'id';
    if (!validOrderOptions.includes(order.toUpperCase())) order = 'ASC';

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 5; 
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT 
        m.id, 
        m.nome, 
        m.status, 
        m.created_at, 
        m.updated_at, 
        m.deleted_at,
        COUNT(t.id) AS numero_topicos
      FROM 
        materias m
      LEFT JOIN 
        topicos t
      ON 
        m.id = t.materia_id
      WHERE m.deleted_at IS NOT NULL OR m.deleted_at IS NULL  -- 🔥 GARANTE QUE TODAS AS MATÉRIAS SEJAM INCLUÍDAS
    `;

    const params = [];

    if (search) {
        query += ' AND m.nome LIKE ?';
        params.push(`%${search}%`);
    }

    query += `
      GROUP BY m.id, m.nome, m.status, m.created_at, m.updated_at, m.deleted_at
      ORDER BY ${sort} ${order}
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    const [materias] = await db.execute(query, params);

    // 🔥 Contagem total para paginação sem excluir matérias deletadas
    let countQuery = `
      SELECT COUNT(*) AS count 
      FROM materias
      WHERE deleted_at IS NOT NULL OR deleted_at IS NULL  -- 🔥 GARANTE QUE CONTA TUDO
    `;

    if (search) {
        countQuery += ' AND nome LIKE ?';
    }

    const countParams = [];
    if (search) countParams.push(`%${search}%`);

    const [[{ count }]] = await db.execute(countQuery, countParams);

    console.log("Matérias carregadas no modal:", materias); // 🔍 Debug para verificar

    return {
        totalItems: count,
        currentPage: pageInt,
        totalPages: count > 0 ? Math.ceil(count / limitInt) : 1,
        items: materias,
    };
},



  // Buscar uma matéria pelo ID, incluindo itens excluídos logicamente
  getMateriaById: async (id, showDeleted = false) => {
    let query = `SELECT * FROM materias WHERE id = ?`;
    if (!showDeleted) {
      query += ` AND deleted_at IS NULL`;
    }
    const [materia] = await db.execute(query, [id]);
    return materia[0];
  },

  getTopicosByMateria2: async (materiaId, editalId) => {
    const query = `
      SELECT 
        COUNT(t.id) AS totalDisponiveis,
        SUM(COALESCE(et.status, t.status) = 1) AS totalAtivos
      FROM topicos t
      LEFT JOIN editais_topicos et 
        ON t.id = et.topico_id 
        AND et.edital_id = ?
      WHERE t.materia_id = ?
    `;

    const [result] = await db.execute(query, [editalId, materiaId]);
    return result[0];
  },
  
  getEditaisByMateriaId: async (materiaId) => {
    const query = `
      SELECT e.id, e.nome 
      FROM editais e
      JOIN editais_materias em ON e.id = em.edital_id
      WHERE em.materia_id = ? AND e.deleted_at IS NULL
    `;

    const [editais] = await db.execute(query, [materiaId]);
    return editais;
  },


  // Atualizar uma matéria
  updateMateria: async (id, nome, status) => {
    const [result] = await db.execute(
      'UPDATE materias SET nome = ?, status = ? WHERE id = ?',
      [nome, status, id]
    );
    return result.affectedRows > 0;
  },

  // Alterar o status de uma matéria (ativo/inativo)
  toggleStatus: async (id, status) => {
    const [result] = await db.execute('UPDATE materias SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  // Exclusão suave (soft delete)
  softDeleteMateria: async (id) => {
    const [result] = await db.execute('UPDATE materias SET deleted_at = NOW() WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Restauração de uma matéria excluída
  restoreMateria: async (id) => {
    const [result] = await db.execute('UPDATE materias SET deleted_at = NULL WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = MateriaModel;
