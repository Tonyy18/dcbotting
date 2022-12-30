const {ValidatorValues} = require("../../../../modules/common.js")

function getValidEmail() {
    return "toni.isotalo@hotmail.com"
}
function getInvalidEmail() {
    return "toni.isotalohotmail.com"
}

function getValidPassword() {
    return "1".repeat(ValidatorValues.password.minLength)
}
function getInvalidPassword() {
    return "1".repeat(ValidatorValues.password.maxLength + 15)
}

module.exports.getValidEmail = getValidEmail;
module.exports.getInvalidEmail = getInvalidEmail;
module.exports.getValidPassword = getValidPassword;
module.exports.getValgetInvalidPasswordidEmail = getInvalidPassword;