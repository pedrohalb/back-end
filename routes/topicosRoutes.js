const express = require('express');
const TopicoController = require('../controllers/TopicoController');
const router = express.Router();
const upload = require('../middlewares/upload');

router.get('/', TopicoController.getTopicos);
router.get('/materia/:materiaId', TopicoController.getTopicosByMateria); // Rota para tópicos por matéria
router.get('/materias/:id/topicos', TopicoController.getTopicosByMateriaWithTotal);
router.get('/:id', TopicoController.getTopicoById); // Nova rota para buscar tópico por ID
router.post('/', TopicoController.addTopico);
router.patch('/:id', TopicoController.updateTopico); // Rota para atualizar um tópico
router.patch('/:id/status', TopicoController.updateTopicoStatus);
router.patch('/:id/status', TopicoController.toggleStatus);
router.delete('/:id', TopicoController.deleteTopico);

module.exports = router;