require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Conexão MySQL
const editaisRoutes = require('./routes/editaisRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const topicosRoutes = require('./routes/topicosRoutes');
const arquivosRoutes = require('./routes/arquivosRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(cors());
app.use(express.json());

// Testa conexão com o MySQL
db.execute('SELECT 1')
  .then(() => console.log('Conexão com o MySQL bem-sucedida!'))
  .catch((err) => {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1); // Encerra o servidor em caso de erro
  });

// Rotas
app.use('/api/editais', editaisRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/topicos', topicosRoutes);
app.use('/api/arquivos', arquivosRoutes);
app.use('/api/auth', authRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
