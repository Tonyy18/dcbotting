describe('Asks for a new token', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/editor')
    cy.get("input[id='tokenInput']").type("test token")
    cy.get("#token-form > input[type='submit']").click()
  });
})