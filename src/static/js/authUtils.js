function passwordsMatch(current, inputs) {
    if(inputs[current] == inputs["password"]) {
        return true
    }
    return "passwords doesn't match"
}
function validateEmail(current, inputs) {
    const email = inputs[current];
    if($.trim(email) == "") {
        return "email is required";
    }
    const valid = String(email)
                .toLowerCase()
                .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
    if(!valid) {
        return "invalid email"
    }
    return true;
}
const validations = {
    "username": [2, 20],
    "password": [6, 50],
    "password2": passwordsMatch,
    "email": validateEmail,
    "name": [2, 30]
}
function getInputs(parent) {
    const inputs = $(parent).find("input");
    const results = {}
    $.each(inputs, (i) => {
        if($(inputs[i]).attr("type") == "submit") {
            return;
        }
        results[$(inputs[i]).attr("name")] = $.trim($(inputs[i]).val());
    })
    return results;
}
function removeRegisteringError() {
    $("#register-form input").removeClass("error")
    $("#register-form").find(".main-error").hide();
}
$("#register-form input:not([type='submit'])").on("focus", function() {
    removeRegisteringError();
})
$("#register-form").on("submit", function(e) {
    $(this).find("input").blur();
    removeRegisteringError();
    e.preventDefault();
    const inputs = getInputs($(this))
    const errorDom = $(this).find(".main-error");
    for(key in inputs) {
        if(key in validations) {
            if(validations[key] == "pass") {
                continue;
            }
            if(typeof validations[key] == "function") {
                const res = validations[key](key, inputs)
                if(res === true) {
                    continue;
                } else {
                    $(this).find("input[name='" + key + "']").addClass("error");
                    $(errorDom).text(res).css("display", "block");
                    return;
                }
            }
            if(inputs[key] == "") {
                $(this).find("input[name='" + key + "']").addClass("error");
                $(errorDom).text(key + " is required").css("display", "block");
                return;
            }
            if(inputs[key].length < validations[key][0]) {
                //Too short
                $(this).find("input[name='" + key + "']").addClass("error");
                $(errorDom).text(key + " is too short").css("display", "block");
                return;
            }
            if(inputs[key].length > validations[key][1]) {
                //Too long
                $(this).find("input[name='" + key + "']").addClass("error");
                $(errorDom).text(key + " is too long").css("display", "block");
                return
            }
        } else {
            console.error("Validation for field '" + key + "' is not defined")
            return;
        }
    }
    $.ajax({
        type: "POST",
        url: "/auth/register",
        data: inputs,
        success: () => {
            $(this).find("input").hide();
            $(this).append('<img src="/static/images/loader.gif" class="loader">')
            $(errorDom).text("Success, you can now login").css("display", "block");
            setTimeout(() => {
                $(this).parent().find("[data-changeTo]").trigger("click");
                setTimeout(() => {
                    $(this).find("input").show();
                    $(this).find(".loader").remove();
                }, 1000)
            },2000)
        },
        error(results) {
            $(errorDom).text(results.responseJSON["message"]).css("display", "block");
        }
    })
    return false;
})

function setupLoginForm(success=()=>{}, error=()=>{}) {

    $("#login-form").on("submit", function(e) {
        e.preventDefault();
        const errorDom = $(this).find(".main-error");
        errorDom.hide();
        const email = $.trim($(this).find("[name='email']").val());
        const password = $.trim($(this).find("[name='password']").val());
        Requests.login({
            email: email,
            password: password
        }, (results) => {
            localStorage.setItem("jwt", results["message"]);
            closeModal("login-modal");
            success(results);
        }, (err) => {
            $(errorDom).text(err["message"]).css("display", "block");
            error();
        })
        return false;
    })
}