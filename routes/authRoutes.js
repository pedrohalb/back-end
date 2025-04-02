const express = require('express');
const { login, forgotPassword, resetPassword, verifyAdmin } = require('../controllers/authController');

const router = express.Router();

// 🛠️ Rotas de Autenticação (Acessíveis a todos)
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 🔐 Rotas protegidas para administradores
router.get('/admin/dashboard', verifyAdmin, (req, res) => {
    res.json({ message: "Bem-vindo ao painel administrativo!" });
});

// Exemplo de rota protegida para listar usuários apenas para admins
router.get('/admin/users', verifyAdmin, (req, res) => {
    res.json({ message: "Lista de usuários - Apenas administradores podem acessar" });
});

module.exports = router;
