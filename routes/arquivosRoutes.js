const express = require('express');
const ArquivoController = require('../controllers/ArquivoController');
const upload = require('../middlewares/upload'); // Middleware para lidar com o upload de arquivos
const router = express.Router();

router.post('/upload', upload, ArquivoController.addArquivo);
//router.post('/', upload.single('file'), ArquivoController.addArquivo);
router.get('/', ArquivoController.getArquivos);
router.patch('/:id', ArquivoController.updateArquivo);
router.delete('/:id', ArquivoController.deleteArquivo);

module.exports = router;
