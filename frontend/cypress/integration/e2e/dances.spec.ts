describe('Dances page', () => {
  it('visits home page', () => {
    cy.visit('/dances');
  })

  it('is accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  })
})
