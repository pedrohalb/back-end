const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserByEmail, updateResetToken, updatePassword, validateUserCredentials } = require('../models/authModel');
const { sendPasswordResetEmail } = require('./emailService');
require('dotenv').config();

// Login de usuário (diferenciando admin e user)
const loginUser = async (email, password) => {
    const user = await validateUserCredentials(email);

    if (!user) {
        throw new Error('E-mail ou senha incorretos');
    }

    // Compara a senha fornecida com a senha encriptografada no banco de dados
    if (password !== user.password) {
        throw new Error('E-mail ou senha incorretos');
    }    

    // Define tempo de expiração baseado na role
    const expiresIn = user.role === 'admin' ? '12h' : '7d';

    // Gera um token JWT com as informações do usuário, incluindo a role
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    return { message: 'Login bem-sucedido', token, role: user.role };
};

// Solicitar recuperação de senha
const requestPasswordReset = async (email) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    await updateResetToken(email, resetToken);

    //const resetLink = `https://dev-edital-revisado.cursocei.app/redefinicao-senha?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    return { message: 'Token de recuperação enviado por e-mail. Verifique sua caixa de entrada.' };
};

// Redefinição de senha
const resetUserPassword = async (token, newPassword) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserByEmail(decoded.email);

        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        if (user.reset_token !== token) {
            throw new Error('Token inválido ou expirado.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updatePassword(decoded.email, hashedPassword);

        return { message: 'Senha redefinida com sucesso!' };
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        throw new Error('Token inválido ou expirado.');
    }
};

module.exports = {
    loginUser,
    requestPasswordReset,
    resetUserPassword
};
