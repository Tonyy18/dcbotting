Cypress.Commands.add("submitToken", () => {
    cy.get('#tokenInput', { timeout: 3000 }).should('be.visible');
    cy.get("#tokenInput").type(Cypress.env("token"))
    cy.get("#token-form input[type='submit']").click()
})
Cypress.Commands.add("openLoginModal", () => {
    cy.get("[data-modal='login-modal']").click()
})
Cypress.Commands.add("inputLoginEmail", (email) => {
    cy.get("#login-form input[name='email']").type(email)
})
Cypress.Commands.add("inputLoginPassword", (password) => {
    cy.get("#login-form input[name='password']").type(password)
})
Cypress.Commands.add("submitLogin", () => {
    cy.get("#login-form input[type='submit']").click()
})
Cypress.Commands.add("loginErrorContains", (text) => {
    cy.get("#login-form .main-error").contains(text)
})