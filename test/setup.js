// Load environment variables
require('dotenv').load();

const express = require('express');
const supertest = require('supertest');
const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const User = require('../db/models/User');
const SignupVerification = require('../db/models/SignupVerification');
const { getTestData } = require('./testData');





before(function connectDatabase() {
    const mongo_url = 'mongodb://localhost:27017/piano_visualizer_test_db'
    return mongoose.connect(mongo_url);
});
before(function setApi() {

    // Create an express application object
    const app = express();

    const route = proxyquire('../api/api', {});

    // Bind a route to our application
    route('/api', app);
    this.api = supertest.agent(app);
});
before(function setLoginFunctions() {
    this.login = () => {
        return new Promise((resolve, reject) => {
            this.api.post('/api/login')
                .send({
                    email: this.testData.user.email,
                    password: this.testData.user.password
                })
                .expect(200, (err, res) => {
                    const { user_name } = res.body.data.user;
                    expect(user_name).to.equal(this.testData.user.user_name);
                    expect(err).to.be.null;
                    return resolve();
                });
        });
    };
    this.logout = () => {
        return new Promise((resolve, reject) => {
            this.api.post('/api/login')
                .send()
                .expect(200, (err, res) => {
                    expect(err).to.be.null;
                    return resolve();
                });
        });
    };
});
beforeEach(async function emptyCollections() {
    return Promise.all([
        User.find().remove(),
        SignupVerification.find().remove()
    ]);
});
beforeEach(function setTestData() {
    this.testData = getTestData();
});
beforeEach(function addTestUser(done) {
    this.api.post('/api/signup')
        .send(this.testData.user)
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
            expect(res.body.data.verification_id).to.be.a('string');
            const verification_id = res.body.data.verification_id;
            this.api.post('/api/verify_signup')
                .send({ verification_id })
                .expect(200, (err, res) => {
                    if (err) {
                        console.error('Error while verifying test user', err);
                        throw err;
                    }
                    const user = res.body.data.user;
                    expect(user.user_name).to.equal(this.testData.user.user_name);
                    done();
                });
        });
});
beforeEach(function login() {
    return this.login();
});

after(function disconnectDatabase(done) {
    mongoose.disconnect(done);
})