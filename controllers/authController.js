const { loginUser, requestPasswordReset, resetUserPassword } = require('../services/authService');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await loginUser(email, password);
        res.json(result); // Retorna o token e a role do usuário
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await requestPasswordReset(email);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const result = await resetUserPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 🔐 Middleware para verificar se o usuário é admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Pega o token do header

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar.' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

module.exports = {
    login,
    forgotPassword,
    resetPassword,
    verifyAdmin // Middleware para proteger rotas de admin
};
