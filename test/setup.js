// Load environment variables
require('dotenv').load();

const express = require('express');
const sessionConfig = require('../config/session');
const passportConfig = require('../config/passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    sessionConfig(app);
    passportConfig(app);

    const route = proxyquire('../api/api', {});

    // Bind a route to our application
    route('/api', app);
    this.api = supertest.agent(app);
});
before(function setAddTestUserFunction() {
    this.addTestUser = (testUser = this.testData.user) => {
        this.api.post('/api/signup')
            .send(testUser)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) return done(err);
            
                expect(res.body.data.verification_id).to.be.a('string');
                const verification_id = res.body.data.verification_id;
                this.api.post('/api/verify_signup')
                    .send({ verification_id })
                    .expect(200, (err, res) => {
                        if (err) return done(err);
                
                        const user = res.body.data.user;
                        expect(user.user_name).to.equal(testUser.user_name);
                        return done();
                    });
            });
    };
});
before(function setLoginFunctions() {
    this.login = (user = this.testData.user) => {
        return new Promise((resolve, reject) => {
            this.api.post('/api/login')
                .send({
                    email: user.email,
                    password: user.password
                })
                .expect(200, (err, res) => {
                    if (err) return reject(err);
                
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
                    if (err) return reject(err);
               
                    return resolve();
                });
        });
    };
    this.addTestUserAndLogin = (user = this.testData.user) => this.addTestUser(user).then(() => this.login(user));
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

after(function disconnectDatabase(done) {
    mongoose.disconnect(done);
})
