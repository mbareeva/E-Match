
const { Context } = require("mocha");
const bonsai = process.env.BONSAI_URL || 'http://localhost:9200';
import data from '../../fixtures/mock_data.json';

// **** METHODS **** //
context('Elasticsearch testing', () => {
  describe('Basics', () => {
    it('checks whether the cluster is running', () => {
      cy.request(bonsai)
        .then((response) => {
          expect(response).property('status').to.equal(200)
          expect(response).property('body').to.have.property('cluster_name')
        })
    })
    it("searches all the available users", () => {
      cy.request(bonsai + '/users/_search')
        .then((response) => {
          expect(response).property('status').to.equal(200)
          expect(response.body.hits.total).property('value').to.not.eq(0)
        })
    })
    it("searches all the availabale media items", () => {
      cy.request(bonsai + '/medias/_search')
        .then((response) => {
          expect(response).property('status').to.equal(200)
          expect(response.body.hits.total).property('value').to.not.eq(0)
        })
    })
    it("searches for specialisation & shows the results", () => {
      cy.request({
        method: 'GET',
        url: bonsai + '/users/_search',
        body: { query: { match: { specialisation: "Athlete" } } }
      }).then((response) => {
        expect(response).property('status').to.equal(200)
        expect(response.body.hits.total).property('value').to.not.eq(0)
      })
    })
    it("shows no results for the specialisation search", () => {
      cy.request({
        method: 'GET',
        url: bonsai + '/users/_search',
        body: { query: { match: { specialisation: "Doctor" } } }
      }).then((response) => {
        expect(response).property('status').to.equal(200)
        expect(response.body.hits.total).property('value').to.eq(0)
      })
    })

    it("shows results of a term search in captions", () => {
      cy.request({
        method: 'GET',
        url: bonsai + '/medias/_search',
        body: { query: { match: { caption: "gym" } } }
      }).then((response) => {
        expect(response).property('status').to.equal(200)
        expect(response.body.hits.total).property('value').to.not.eq(0)
      })
    })

    it("shows results of a multi-match search for captions", () => {
      cy.request({
        method: 'GET',
        url: bonsai + '/users/_search',
        body: {
          query: {
            multi_match: {
              query: data.user.latestMedia[0].caption,
              //type: "best_fields",
              fields: ["latestMedia.caption", "biography"]
            }
          }
        }
      }).then((response) => {
        expect(response).property('status').to.equal(200)
        expect(response.body.hits.total).property('value').to.not.eq(0)
      })
    })


  })
})