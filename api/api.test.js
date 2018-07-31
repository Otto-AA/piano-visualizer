const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError } = require('./ErrorResponse');
const db = require('../db/db');
db.connect();

describe('Integration test: API', function () {
    before(function (done) {
        // Create an express application object
        const app = express();

        // Get our router module, with a stubbed out User dependency
        // we stub this out so we can control the results returned by
        // the User module to ensure we execute all paths in our code
        const route = proxyquire('./api.js', {
        });

        // Bind a route to our application
        route('/api', app);

        // Get a supertest instance so we can make requests
        this.request = supertest(app);

        done();
    });
    
    after(function () {
      db.disconnect((err, res) => {
          if (err) {
              return console.error('Error while disconnecting from database', err);
          }
          return console.log('Disconnected from database', res))
      });
    });

    it('should respond with 404', function (done) {
        this.request.get('/api/user')
            .expect('Content-Type', /json/)
            .expect(404, function (err, res) {
                expect(res.body).to.deep.equal(notFoundError);
                done();
            });
    });
});
