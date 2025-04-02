const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Pega o token do header

    if (!token) {
        return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Anexa o usuário decodificado à requisição
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Sua sessão expirou. Faça login novamente.' });
    }
};

module.exports = authMiddleware;
