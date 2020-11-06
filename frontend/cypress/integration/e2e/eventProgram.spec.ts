describe('Event program editor', () => {
  it('visits event program editor', () => {
    cy.visit('/events/GsiRDI7oYFXRnDZ3/program');
    cy.contains("Muokkaa tanssiaisohjelmaa")
  })

  it('is accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  })
})
