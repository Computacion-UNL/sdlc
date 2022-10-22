'use strict'

const { randomPassword } = require('secure-random-password');
const { passwordStrength } = require('check-password-strength');
const joi = require('joi');
const crypto = require('crypto');

const { transporter, verify_email, recovery_template } = require('../lib/mailer');
const helper = require('../lib/helper');
const jwt = require('../lib/jwt');

const User = require('../models/user.model');
const Token = require('../models/token.model');
const AuthController = {};

//Registrar Usuario
AuthController.signup = (req, res) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                return res.status(400).send({ msg: 'Ya existe una cuenta asociada con este email.' });
            } else {
                delete req.body?.image;
                if (passwordStrength(req.body.password).id === 0 || passwordStrength(req.body.password).id === 1) {
                    return res.status(400).send({
                        msg: `Contraseña Débil. Se debe incluir mayúsculas, minúsculas, caracteres, números y tener como mínimo 8 caracteres`
                    });
                } else {
                    if(process.env.NODE_ENV !== 'production') 
                        req.body.verified = true;                    

                    let user = new User({ ...req.body, password: helper.generateHash(req.body.password) });
                    
                    if(process.env.NODE_ENV !== 'production') 
                        delete req.body.verified; 

                    let validate = user.joiValidate({ ...req.body, password: helper.generateHash(req.body.password) });
                    if (validate.error) {
                        return res.status(400).send(validate.error.details);
                    } else {
                        user.save()
                            .then((newUser) => {
                                if (!newUser) {
                                    return res.status(500).send({ msg: 'No se ha registrado la cuenta' });
                                } else {
                                    var token = new Token({ _userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });
                                    token.save()
                                        .then(async (tok) => {
                                            if(process.env.NODE_ENV === 'production') {
                                                const { transport, sender, user } = await transporter();

                                                transport.sendMail({
                                                    from: '"'+sender+'" <'+user+'>',
                                                    to: req.body.email,
                                                    subject: "Activación de cuenta",
                                                    html: verify_email(process.env.FRONTEND_URL + '/?verify=' + tok.token + '&email=' + req.body.email)
                                                }, (err, info) => {
                                                    if (err) {
                                                        console.log("ERROR: ", err);
                                                        return res.status(500).send({ msg: 'Ha ocurrido un error al intentar enviar el correo.' });
                                                    }
                                                    console.log("INFO: ", info);
                                                    return res.status(200).send({ user: newUser });
                                                });
                                            }else {
                                                return res.status(200).send({ user: newUser });
                                            }
                                        }).catch(err => {
                                            console.log('Error' + err);
                                            return res.status(500).send({ msg: 'Error al registrar usuario' });
                                        });
                                }
                            }).catch(err => {
                                console.log('Error' + err);
                                return res.status(500).send({ msg: 'Error al registrar usuario' });
                            });
                    }
                }


            }
        }).catch(err => {
            console.log('Error' + err);
            return res.status(500).send({ msg: 'Error al registrar usuario' });
        });
};

//Iniciar Sesión
AuthController.signin = (req, res) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res.status(401).send({ msg: 'El usuario no está registrado' });
            } else if (user.active == false) {
                return res.status(401).send({ msg: 'El usuario está inactivo' });
            }
            if (helper.matchPassword(req.body.password, user.password)) {
                if (!user.verified) {
                    return res.status(401).send({ msg: 'Tu email aún no ha sido verificado.' });
                }

                return res.status(200).send({
                    id: user.id,
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email,
                    image: user.image,
                    admin: user.admin,
                    token: jwt.createToken(user)
                });
            } else {
                return res.status(401).send({ msg: 'Clave incorrecta' });
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al iniciar sesión' });
        });
};

//Obtener información actualizada del usuario
AuthController.getData = (req, res) => {
    User.findOne({ _id: req.user.id })
        .then(user => {
            return res.status(200).send({
                id: user._id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                image: user.image,
                admin: user.admin,
                token: jwt.createToken(user)
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
        });
};

AuthController.recovery = (req, res) => {
    const generated_password = randomPassword();
    try {
        User.findOneAndUpdate({ email: req.body.email }, { password: helper.generateHash(generated_password) })
            .then(async (result) => {
                if (!result) {
                    return res.status(404).send({ msg: 'Usuario no encontrado.' });
                } else {
                    if(process.env.NODE_ENV === 'production') {
                        const { transport, sender, user } = await transporter();

                        transport.sendMail({
                            from: '"'+sender+'" <'+user+'>',
                            to: req.body.email,
                            subject: "Nueva contraseña",
                            html: recovery_template(req.body.email, generated_password, process.env.FRONTEND_URL)
                        }, (err, info) => {
                            if (err) {
                                console.log("ERROR: ", err);
                                return res.status(500).send({ msg: 'Ha ocurrido un error al intentar enviar el correo.' });
                            }
                            console.log("INFO: ", info);
                            return res.status(200).send({ msg: 'Se ha enviado un correo con las nuevas credenciales.' });
                        });
                    }else {
                        return res.status(200).send({ msg: 'Se ha enviado un correo con las nuevas credenciales.' });
                    }
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).send({ msg: 'Error al intentar recuperar la cuenta.' });
            });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al intentar recuperar la cuenta.' });
    }
}

AuthController.resend_activation = (req, res) => {
    console.log(req.body.email)
    User.findOne({ email: req.body.email })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'Usuario no encontrado.' });
            } else {
                if (result.verified) {
                    return res.status(400).send({ msg: 'La cuenta ya está verificada.' });
                }

                var token = new Token({ _userId: result._id, token: crypto.randomBytes(16).toString('hex') });
                token.save()
                    .then(async (tok) => {
                        if(process.env.NODE_ENV === 'production') {
                            const { transport, sender, user } = await transporter();
                            
                            transport.sendMail({
                                from: '"'+sender+'" <'+user+'>',
                                to: req.body.email,
                                subject: "Activación de cuenta",
                                html: verify_email(process.env.FRONTEND_URL + '/?verify=' + tok.token + '&email=' + req.body.email)
                            }, (err, info) => {
                                if (err) {
                                    console.log("ERROR: ", err);
                                    return res.status(500).send({ msg: 'Ha ocurrido un error al intentar enviar el correo.' });
                                }
                                console.log("INFO: ", info);
                                return res.status(200).send({ msg: 'Se ha enviado un correo de verificación.' });
                            });
                        }else {
                            return res.status(200).send({ msg: 'Se ha enviado un correo de verificación.' });
                        }
                    }).catch(err => {
                        console.log('Error' + err);
                        return res.status(500).send({ msg: 'Error al registrar usuario' });
                    });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al intentar recuperar la cuenta.' });
        });
}

AuthController.verify_account = (req, res) => {
    Token.findOne({ token: req.body.token })
        .then(token => {
            if (!token) {
                return res.status(400).send({ msg: 'Tu enlace de verificación puede haber caducado. Intentar reenviar la verificación.' });
            } else {
                User.findOne({ _id: token._userId, email: req.params.email })
                    .then(user => {
                        if (!user) {
                            return res.status(401).send({ msg: 'No pudimos encontrar un usuario para esta verificación. ¡Por favor regístrate!' });
                        } else if (user.verified) {
                            return res.status(200).send({ msg: 'El usuario ya ha sido verificado. Por favor inicia sesión.' });
                        } else {
                            user.verified = true;

                            user.save()
                                .then(resp => {
                                    return res.status(200).send({ msg: 'Tu cuenta ha sido verificada con éxito.' });
                                }).catch(err => {
                                    console.log(err);
                                    return res.status(500).send({ msg: 'Error al verificar la cuenta.' });
                                });
                        }
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).send({ msg: 'Error al verificar la cuenta.' });
                    });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al verificar la cuenta.' });
        });
}

module.exports = AuthController;
