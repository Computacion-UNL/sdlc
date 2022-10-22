'use strict'
const jwt = require('jwt-simple');
const moment = require('moment');

exports.createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        userName: user.userName,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(2, 'days').unix()
    }

    return jwt.encode(payload, process.env.TOKEN_SECRET);
}
