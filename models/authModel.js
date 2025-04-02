const db = require('../config/db');

// Buscar usuário pelo e-mail (verifica tanto users quanto admins)
const getUserByEmail = async (email) => {
    const [users] = await db.execute('SELECT id, email, password, reset_token, "user" AS role FROM users WHERE email = ?', [email]);
    const [admins] = await db.execute('SELECT id, email, password, reset_token, "admin" AS role FROM admins WHERE email = ?', [email]);

    if (admins.length > 0) return admins[0];
    if (users.length > 0) return users[0];

    return null;
};

// Atualizar token de redefinição de senha (checa nas duas tabelas)
const updateResetToken = async (email, token) => {
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    const [admins] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);

    if (admins.length > 0) {
        return db.execute('UPDATE admins SET reset_token = ? WHERE email = ?', [token, email]);
    } else if (users.length > 0) {
        return db.execute('UPDATE users SET reset_token = ? WHERE email = ?', [token, email]);
    }
    
    return null;
};

// Atualizar senha e remover token (checa nas duas tabelas)
const updatePassword = async (email, hashedPassword) => {
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    const [admins] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);

    if (admins.length > 0) {
        return db.execute('UPDATE admins SET password = ?, reset_token = NULL WHERE email = ?', [hashedPassword, email]);
    } else if (users.length > 0) {
        return db.execute('UPDATE users SET password = ?, reset_token = NULL WHERE email = ?', [hashedPassword, email]);
    }
    
    return null;
};

// Validar credenciais no login (agora retorna a role do usuário)
const validateUserCredentials = async (email) => {
    const user = await getUserByEmail(email);
    return user ? user : null;
};

module.exports = {
    getUserByEmail,
    updateResetToken,
    updatePassword,
    validateUserCredentials
};
