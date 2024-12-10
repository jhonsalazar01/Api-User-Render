const mail = {
    host: 'smtp.gmail.com',
    port: 465, // o puedes usar 587 para TLS
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: 'tu-cuenta@gmail.com', // tu dirección de correo de Gmail
      pass: 'contraseña-de-aplicación' // la contraseña de aplicación generada
    }
  }
  
  module.exports = {
    mail
  }
  