const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError } = require('./ErrorResponse');
const mongoose = require('mongoose');
const mongo_url = process.env.MONGO_URL;
mongoose.connect(mongo_url, (err) => {
    if (err) {
        console.error('Error while connecting database', err);
        throw err;
    }
});

describe('Integration test: API', function () {
    const testUser = {
        "user_id": "____default_user____",
      "user_name": "____default_user____",
      "description": "It's a me, Mario!",
      "email": "user@example.com",
      "password": "myPass007"
    };
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
    
    before(function deleteTestUser(done)  {
        this.request.delete(`/api/user?user_id=${testUser.user_id}`)
            .then(() => done())
            .catch(() => done());
    });
    
    before(function createTestUser(done) {
        this.request.post('/api/signup')
            .send(testUser)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                expect(res.body.data.verification_id).to.be.a('string');
                const verification_id = res.body.data.verification_id;
                this.request.post('/api/verify_signup')
                    .send({ verification_id })
                    .expect(200, (err, res) => {
                        const user = res.body.data.user;
                        expect(user.user_name).to.equal(testUser.user_name);
                        done();
                    });
            });
    });
        
    
    after(function () {
      mongoose.disconnect((err, res) => {
          if (err) {
              return console.error('Error while disconnecting from database', err);
              throw err;
          }
      });
    });
            
    it('should respond with 404', function (done) {
        this.request.get('/api/user?user_id=')
            .expect('Content-Type', /json/)
            .expect(404, function (err, res) {
                expect(res.body).to.deep.equal(notFoundError);
                done();
            });
    });
    
    it('should respond with 200 and test user', function (done) {
        this.request.get(`/api/user?user_id=${testUser.user_id}`)
            .expect(200, function (err, res) {
                console.log(res.body);
                expect(res.body.data.user).to.be.an('object');
                done();
            });
    });
});
