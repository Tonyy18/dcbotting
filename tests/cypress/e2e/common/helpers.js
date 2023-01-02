const {ValidatorValues} = require("../../../../modules/common.js")

function getString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getValidEmail() {
    return getString(5) + getString(5) + "@hotmail.com" 
}
function getInvalidEmail() {
    return getString(5) + getString(5) + "hotmail.com" 
}

function getValidPassword() {
    return getString(ValidatorValues.password.minLength)
}
function getInvalidPassword(tooLong = true) {
    if(!tooLong) {
        return getString(ValidatorValues.password.minLength - 1)
    }
    return getString(ValidatorValues.password.maxLength + 1)
}

function getValidUsername() {
    return getString(ValidatorValues.username.minLength)
}

function getInvalidUsername(tooLong = true) {
    if(!tooLong) {
        return getString(ValidatorValues.username.minLength - 1)
    }
    return getString(ValidatorValues.username.maxLength + 1)
}

module.exports.getString = getString;
module.exports.getValidEmail = getValidEmail;
module.exports.getInvalidEmail = getInvalidEmail;
module.exports.getValidPassword = getValidPassword;
module.exports.getInvalidPassword = getInvalidPassword;
module.exports.getValidUsername = getValidUsername;
module.exports.getInvalidUsername = getInvalidUsername;