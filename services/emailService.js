const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Define como `true` se estiver usando SSL/TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `<${process.env.SMTP_FROM}>`, // Nome amigável + e-mail personalizado
        to: email,
        subject: 'Recuperação de Senha - Edital Revisado',
        text: `Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:\n\n${resetLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de recuperação enviado para: ${email}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail para ${email}:`, error);
        throw new Error('Erro ao enviar o e-mail de recuperação de senha.');
    }
};

module.exports = { sendPasswordResetEmail };
