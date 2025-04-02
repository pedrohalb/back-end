const express = require('express');
const MateriaController = require('../controllers/MateriaController');
const router = express.Router();

router.post('/', MateriaController.addMateria);  // Adicionar matéria
router.get('/', MateriaController.getMaterias);  // Buscar todas as matérias com filtros
router.get('/', MateriaController.getMateriasForModal);  // Buscar todas as matérias para o modal
router.get('/:id', MateriaController.getMateriaById);  // Buscar uma matéria pelo ID
router.get('/:id/topicos', MateriaController.getTopicosByMateria2);  // Buscar tópicos de uma matéria
router.get('/:id/editais', MateriaController.getEditaisByMateriaId);  // Buscar editais onde a matéria está associada
router.patch('/:id', MateriaController.updateMateria);  // Atualizar matéria
router.patch('/:id/status', MateriaController.toggleStatus);  // Alterar status da matéria
router.delete('/:id', MateriaController.softDeleteMateria);  // Exclusão suave da matéria
router.patch('/:id/restore', MateriaController.restoreMateria);  // Restauração da matéria excluída

module.exports = router;
