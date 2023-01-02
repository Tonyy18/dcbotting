class ValidatorValues {
    static username = {
        minLength: 2,
        maxLength: 20
    }
    static password = {
        minLength: 6,
        maxLength: 50
    }
    static name = {
        minLength: 2,
        maxLength: 30
    }
}

class Validator {
    static username(text) {
        if(text.length < ValidatorValues.username.minLenth) {
            return "username is too short"
        }
        if(text.length > ValidatorValues.username.maxLength) {
            return "username is too long"
        }
        return true;
    }
    static email(text) {
        const val = String(text)
                .toLowerCase()
                .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        if(!val) {
            return "invalid email"
        }
        return true;
    }
    static password(text) {
        if(text.length < ValidatorValues.password.minLenth) {
            return "password is too short"
        }
        if(text.length > ValidatorValues.password.maxLength) {
            return "password is too long"
        }
        return true;
    }
    static name(text) {
        if(text.length > ValidatorValues.name.minLenth) {
            return "bot name is too long"
        }
        if(text.length < ValidatorValues.name.maxLength) {
            return "bot name is too short";
        }
        return true;
    } 
}
const keysToValidators = {
    "username": Validator.username,
    "email": Validator.email,
    "password": Validator.password,
    "name": Validator.name
}
exports.Validator = Validator;
exports.keysToValidators = keysToValidators;
exports.ValidatorValues = ValidatorValues