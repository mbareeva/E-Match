/// <reference types="cypress" />
import data from '../../fixtures/mock_data.json';

describe('logs into the website', () => {
  beforeEach(() => {
    cy.visit('https://e-match-htw.herokuapp.com/')
  })

  it('displays the login form', () => {
    cy.get('form').should('exist');
    cy.get('div input').should('exist')
    cy.get('div label').should('have.text', '@username')
  })

  it('types into the form the login data', () => {
    cy.get('div input').type(`${data.user.username}{enter}`)
  })
})

describe('gets the personal profile view', () => {

  it('displays the username', () => {
    cy.get('.card-title').should('contain', `${data.user.username}`);
    cy.get('.card-title').contains('@')
  })

  it('displays the specialisation', () => {
    cy.get('h6').should('exist');
  })

  it('displays the biography', () => {
    cy.get('.description').should('exist')
  })

  it('displays the button "Find matches', () => {
    cy.get(':nth-child(1) > a > .btn').as('button')
    cy.get('@button').should('contain', 'Find matches')
    cy.get('@button').parent().should('have.attr', 'href', '/users/matches')
  })

  it('displays the button "Logout"', () => {
    const newItem = 'wheelerfishing'
    cy.get(':nth-child(2) > a > .btn').should('contain', 'Logout')
  })

  it('shows the content of the media item', () => {
    cy.get(':nth-child(1) > a > .card-body').should('not.be.empty')
  })
})

describe('opens the matches page', () => {
  it('clicks on the button "Find matches', () => {
    cy.get(':nth-child(1) > a > .btn').click().then(() => {
      cy.url().should('include', '/users/matches')
    })
  })

  it("displays every match", () => {
    cy.get('.row > .col-md-4 > .card').each(($el) => {
      cy.get($el).children().last().as('card')
      cy.get('@card').children().each(($child, i) => {
        if (i == 6) {
          cy.get($child).children().children().each(($nums) => {
            cy.get($nums).find('p').should('not.be.empty')
          })
        }
        if (i == 7) {
          cy.get($child).should('not.be.empty')
        }
      })
    })
  })
})