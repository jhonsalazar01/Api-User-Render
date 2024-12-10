const router = require('express').Router()
const User = require('../models/user')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

// Esquema del login
const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

// LOGIN
router.post('/login', async (req, res) => {
    // Validaciones de login
    const { error } = schemaLogin.validate(req.body)
    if(error) return res.status(400).json({error: error.details[0].message})
    
    // Validaciond e existencia
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).json({error: 'Usuario no encontrado'})

    // Validacion de password en la base de datos
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).json({error: 'Constraseña invalida'})

    // Creando token
    const token = jwt.sign(
        {
            name: user.name,
            id: user._id
        },
        process.env.TOKEN_SECRET
    );
    
    // Crear el objeto de respuesta
    const responseData = {
        error: null,
        data: {
            token: token,
            userId: user._id,
            name: user.name // Incluye el nombre del usuario
        },
        message: `Bienvenido ${user._id}` // Usando template strings
    };
    
    // Convertir el objeto a JSON
    const responseJson = JSON.stringify(responseData);
    
    // Colocando el token en el header y enviando la respuesta JSON
    res.header('auth-token', token).send(responseJson);
    
})


// REGISTER
router.post('/register', async (req, res) => {

    const { error } = schemaRegister.validate(req.body)

    if (error) {
        return res.status(400).json(
            { error: error.details[0].message }
        )
    }

    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json(
            {error: 'Email ya registrado'}
        )
    }

    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    });
    try {
        const savedUser = await user.save()
        res.json({
            error: null,
            data: savedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
})

router.post('/reset-password', async (req, res) => {
    // Validación de existencia
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Creando token válido por 2 minutos
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET, { expiresIn: '2m' }); // Token válido por 2 minutos
    
    // Respuesta de éxito con el token
    return res.status(200).json({ message: 'Se ha encontrado el usuario', token });
});


router.post('/update-password', async (req, res) => {
    const { token, newPassword } = req.body;

    // Verificar el token
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }

        // Encontrar al usuario por ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10); // El número 10 es el número de saltos

        // Actualizar la contraseña hasheada
        user.password = hashedPassword;
        await user.save();

        // Respuesta de éxito
        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    });
});





module.exports = router