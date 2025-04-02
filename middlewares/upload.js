const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../upload'); // Caminho absoluto
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = (req, res, next) => {
  const multerUpload = multer({ storage }).array('arquivos', 10);
  multerUpload(req, res, (err) => {
    if (err) {
      console.error('Erro no upload:', err);
      return res.status(500).json({ message: 'Erro ao processar arquivos.', error: err.message });
    }

    // Normaliza req.body.topico_id se necessário
    if (Array.isArray(req.body.topico_id)) {
      req.body.topico_id = req.body.topico_id[0];
    }

    next();
  });
};



module.exports = upload;