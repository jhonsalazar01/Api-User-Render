const nodemailer = require('nodemailer');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

// Configuración del transporte
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usa el servicio de Gmail
    auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico de Gmail
        pass: process.env.EMAIL_PASS, // Tu token de aplicación o contraseña
    },
});

// Función para enviar el correo de recuperación
async function sendRecoveryEmail(email, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de contraseña',
        text: `Hola, haz clic en el siguiente enlace para restablecer tu contraseña: ${link}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de recuperación enviado.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}
