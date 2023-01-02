
const helpers = require("./common/helpers.js")

beforeEach(() => {
    cy.visit("/editor");
    cy.submitToken();
})

describe('Login with non existing account', () => {
    it('Account was not found and error displayed', () => {
        cy.openLoginModal();
        cy.inputLoginEmail(helpers.getValidEmail())
        cy.inputLoginPassword(helpers.getValidPassword())
        cy.submitLogin()
        cy.loginErrorContains("Invalid credentials")
    })
})

describe("Registration input validations", () => {
    beforeEach(() => {
        cy.openRegistrationModal();
    })
    it("Username field validations", () => {
        cy.submitRegistration();
        cy.registrationErrorContains("username is required")
        cy.inputRegistrationUsername(helpers.getInvalidUsername(false));
        cy.submitRegistration();
        cy.registrationErrorContains("username is too short")
        cy.inputRegistrationUsername(helpers.getInvalidUsername());
        cy.submitRegistration();
        cy.registrationErrorContains("username is too long")
    })
    it("Email field validations", () => {
        cy.inputRegistrationUsername(helpers.getValidUsername());
        cy.submitRegistration();
        cy.registrationErrorContains("email is required")
        cy.inputRegistrationEmail(helpers.getInvalidEmail());
        cy.submitRegistration();
        cy.registrationErrorContains("invalid email")
    })
    it("Password field validations", () => {
        cy.inputRegistrationUsername(helpers.getValidUsername());
        cy.inputRegistrationEmail(helpers.getValidEmail());
        cy.submitRegistration();
        cy.registrationErrorContains("password is required")
        cy.inputRegistrationPassword(helpers.getInvalidPassword(false));
        cy.submitRegistration();
        cy.registrationErrorContains("password is too short")
        cy.inputRegistrationPassword(helpers.getInvalidPassword());
        cy.submitRegistration();
        cy.registrationErrorContains("password is too long")
        cy.inputRegistrationPassword(helpers.getValidPassword());
        cy.submitRegistration();
        cy.registrationErrorContains("passwords doesn't match")
    })
})

describe("Creating new user", () => {
    const email = helpers.getValidEmail();
    const pass = helpers.getValidPassword();
    it("Creates new account successfully", () => {
        cy.openRegistrationModal();
        cy.createNewUser(helpers.getValidUsername(), email, pass)
    })
    it("Logins to new user", () => {
        cy.loginToUser(email, pass)
        cy.get("#logout-buttons").should("be.visible")
    })
})