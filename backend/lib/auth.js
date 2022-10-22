//Protege la ruta mediante jwt token
'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

exports.ensureAuth = (req,res,next) => {
    //Verifica si la ruta tiene una cabecera de autenticación
    if(!req.headers.authorization)
        return res
               .status(401)
               .send('The request has no authentication header.');

    //Variable que almacena todo el token sin espacios o caracteres raros
    let token = req.headers.authorization.split(' ');    
    if(token.length > 1 && token[0] === 'Bearer'){
        token = token[1].replace(/['"]+/g, '');
    }else{
        return res.status(401).send("Token no válido");
    }

    try {
        var payload = jwt.decode(token, process.env.TOKEN_SECRET);
        if (payload.exp <= moment().unix()) {
            return res.status(401).send("Token Expirado");
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send("Token no válido");
    }

    req.user = payload;
    next();
}
