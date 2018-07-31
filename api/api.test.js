const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError } = require('./Response');

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

    describe('Signup Process', function () {
        it('POST /api/signup should get verification_id and verify user with it', function (done) {
            // Change user_name and email to prevent conflicts
            let newUser = this.testData.user;
            newUser.user_id = 'new_user';
            newUser.user_name = 'new_user';
            newUser.email = 'new.user@mail.com';

            // Get verification_id
            this.request
                .post('/api/signup')
                .send(newUser)
                .expect(200, (err, res) => {
                    if (err) return done(err);

                    const { verification_id } = res.body.data;
                    expect(verification_id).to.be.a('string');

                    // Verify user
                    this.request
                        .post('/api/verify_signup')
                        .send({ verification_id })
                        .expect(200, (err, res) => {
                            const { user_id, user_name } = res.body.data.user;
                            expect(user_id).to.equal(newUser.user_id);
                            expect(user_name).to.equal(newUser.user_name);
                            done(err);
                        })
                });
        });
        it('POST /api/signup should respond with 400 given invalid input', function (done) {
            let invalidInput = this.testData.user;
            delete invalidInput.email;

            this.request
                .post('/api/signup')
                .send(invalidInput)
                .expect(400, function (err, res) {
                    const { message } = res.body;
                    expect(message).to.equal('Invalid arguments');
                    done(err);
                });
        });
        it('POST /api/verify_signup should return 400 given an invalid verification_id', function (done) {
            this.request
                .post('/api/verify_signup')
                .send({ verification_id: 'invalid' })
                .expect(400, (err, res) => {
                    done(err);
                });
        });
        // it('POST /api/signup should respond with 409 if user already exists', function (done) {
        //     this.request
        //         .post('/api/signup')
        //         .send(this.testData.user)
        //         .expect(409, function (err, res) {
        //             const { message } = res.body;
        //             expect(message).to.equal('User already existing');
        //             done();
        //         });
        // });
    });

    describe('User functions', function () {
        it('GET /api/user should respond with 404 given an undefined user_id', function (done) {
            this.request.get('/api/user?user_id=')
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    expect(res.body).to.deep.equal(notFoundError);
                    done(err);
                });
        });

        it('GET /api/user should respond with 200 and test user', function (done) {
            this.request.get(`/api/user?user_id=${this.testData.user.user_id}`)
                .expect(200, (err, res) => {
                    const { user_name, email, user_id, password } = res.body.data.user;
                    expect(user_id).to.be.equal(this.testData.user.user_id);
                    expect(user_name).to.be.equal(this.testData.user.user_name);
                    expect(email).to.be.undefined;
                    expect(password).to.be.undefined;
                    done(err);
                });
        });
    });

});
