const express = require('express');
const EditalController = require('../controllers/EditalController');
const router = express.Router();

// Rota para adicionar um novo edital
router.post('/', EditalController.addEdital);

// Rota para adicionar matérias a um edital
router.post('/:id/materias', EditalController.addMateriasToEdital);

// Rota para buscar editais com filtros (incluindo opção de mostrar excluídos)
router.get('/', EditalController.getEditais);

// Rota para buscar um edital pelo ID (com opção de mostrar excluído)
router.get('/:id', EditalController.getEditalById); // Buscar edital pelo ID

// Rota para buscar matérias associadas a um edital
router.get('/:id/materias', EditalController.getMateriasByEditalId);

// Rota para atualizar nome e status do edital
router.patch('/:id', EditalController.updateEdital);

// Rota para alterar o status do edital (ativo/inativo)
router.patch('/:id/status', EditalController.toggleStatus);

// Rota para realizar exclusão suave (soft delete) do edital
router.patch('/:id/delete', EditalController.softDeleteEdital);

// Rota para restaurar um edital excluído
router.patch('/:id/restore', EditalController.restoreEdital);

// Rota para remover definitivamente um edital (se necessário)
//router.delete('/:id', EditalController.deleteEdital);

// Rota para remover uma matéria específica de um edital
router.delete('/:editalId/materias/:materiaId', EditalController.removeMateriaFromEdital);

module.exports = router;
