class Validator {
    static username(text) {
        if(text < 2) {
            return "username is too short"
        }
        if(text > 20) {
            return "username is too long"
        }
        return true;
    }
    static email(text) {
        const val = String(email)
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
        if(text < 6) {
            return "password is too short"
        }
        if(text > 50) {
            return "password is too long"
        }
    }
}