const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError } = require('./ErrorResponse');

describe('Router: user', function () {
    before(function (done) {
        // A stub we can use to control conditionals
        // this.findByIdStub = sinon.stub();
        this.UserStub = {
            findById: sinon.stub()
        };

        // Create an express application object
        const app = express();

        // Get our router module, with a stubbed out User dependency
        // we stub this out so we can control the results returned by
        // the User module to ensure we execute all paths in our code
        const route = proxyquire('./user.router.js', {
            '../db/models/User': this.UserStub
        });

        // Bind a route to our application
        route('/api', app);

        // Get a supertest instance so we can make requests
        this.request = supertest(app);

        done();
    });
    
    afterEach(function () {
        this.UserStub.findById.reset();
    });

    it('should respond with 404', function (done) {
        // Fake no user response
        this.UserStub.findById.yields(null, null);

        this.request.get('/api/user')
            .expect('Content-Type', /json/)
            .expect(404, function (err, res) {
                expect(res.body).to.deep.equal(notFoundError);
                done();
            });
    });

    it('should respond with 200 and user data', function (done) {
        const userData = {
            user_name: 'Sinon Garfunkel',
            user_id: 'sinongarfunkel'
        }
        this.UserStub.findById.yields(null, userData);

        this.request
            .get('/api/user')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
                expect(res.body).to.deep.equal(userData);
                done();
            });

    })
});