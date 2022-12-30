
const helpers = require("./common/helpers.js")

describe('Login with non existing account', () => {
    it('Account was not found and error displayed', () => {
        cy.visit("/editor");
        cy.submitToken();
        cy.openLoginModal();
        cy.inputLoginEmail(helpers.getValidEmail())
        cy.inputLoginPassword(helpers.getValidPassword())
        cy.submitLogin()
        cy.loginErrorContains("Invalid credentials")
    })
})