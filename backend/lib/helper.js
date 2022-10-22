const bcrypt = require('bcrypt');

const helpers = {};

//Codifica la contraseña
helpers.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

//Decodifica la contraseña
helpers.matchPassword = function (userPassword, password) {
    return bcrypt.compareSync(userPassword, password);
};

helpers.formatDate = function (date) {
    return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear(),
      ].join('/');
};

module.exports = helpers;
