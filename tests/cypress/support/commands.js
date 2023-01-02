Cypress.Commands.add("submitToken", () => {
    cy.get('#tokenInput', { timeout: 3000 }).should('be.visible');
    cy.get("#tokenInput").type(Cypress.env("token"))
    cy.get("#token-form input[type='submit']").click()
})
Cypress.Commands.add("openLoginModal", () => {
    cy.get("[data-modal='login-modal']").click()
})
Cypress.Commands.add("inputLoginEmail", (email) => {
    cy.get("#login-form input[name='email']").focus().clear().type(email)
})
Cypress.Commands.add("inputLoginPassword", (password) => {
    cy.get("#login-form input[name='password']").focus().clear().type(password)
})
Cypress.Commands.add("submitLogin", () => {
    cy.get("#login-form input[type='submit']").click()
})
Cypress.Commands.add("loginErrorContains", (text) => {
    cy.get("#login-form .main-error").contains(text)
})

Cypress.Commands.add("openRegistrationModal", () => {
    cy.get("[data-modal='register-modal']").click();
})
Cypress.Commands.add("inputRegistrationUsername", (name) => {
    cy.get("#register-form input[name='username']").focus().clear().type(name)
})
Cypress.Commands.add("inputRegistrationEmail", (email) => {
    cy.get("#register-form input[name='email']").focus().clear().type(email)
})
Cypress.Commands.add("inputRegistrationPassword", (password) => {
    cy.get("#register-form input[name='password']").focus().clear().type(password)
})
Cypress.Commands.add("inputRegistrationSecondPassword", (password) => {
    cy.get("#register-form input[name='password2']").focus().clear().type(password)
})
Cypress.Commands.add("submitRegistration", () => {
    cy.get("#register-form input[type='submit']").click()
})
Cypress.Commands.add("registrationErrorContains", (text) => {
    cy.get("#register-form .main-error").contains(text)
})
Cypress.Commands.add("createNewUser", (username, email, password) => {
    cy.inputRegistrationUsername(username);
    cy.inputRegistrationEmail(email);
    cy.inputRegistrationPassword(password);
    cy.inputRegistrationSecondPassword(password);
    cy.submitRegistration();
    cy.get("#register-form .loader").should("be.visible")
    cy.registrationErrorContains("Success, you can now login")
})
Cypress.Commands.add("loginToUser", (email, password) => {
    cy.openLoginModal();
    cy.inputLoginEmail(email);
    cy.inputLoginPassword(password);
    cy.submitLogin()
    cy.get("#login-form .main-error").should("not.be.visible")
    cy.wait(2000)
    cy.get("#login-modal").should("not.be.visible")
})