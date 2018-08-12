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
before(function setLoadTestRouterFunction() {
    this.router = this.router || {};

    this.loadTestRouter = (pathRelativeToRoot, moduleProxies = {}) => {
        // Create an express application object
        const app = express();
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(cookieParser());
        sessionConfig(app);
        passportConfig(app);
    
        const route = proxyquire(`../${pathRelativeToRoot}`, moduleProxies);
    
        // Bind a route to our application
        app.use(route);
    
        return supertest.agent(app);
    }
});
before(function setApi() {
    this.api = this.loadTestRouter('api/api');
});
before(function setAddTestUserFunction() {
    this.addTestUser = async (testUser = this.testData.user) => {
        let verification_id;
        await this.api.post('/signup')
            .send(testUser)
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body.data.verification_id).to.be.a('string');
                verification_id = res.body.data.verification_id;
            });

        await this.api.post('/verify_signup')
            .send({ verification_id })
            .expect(200)
            .then(res => {
                const { user } = res.body.data;
                expect(user.user_name).to.equal(testUser.user_name);
            });
        return true;
    };
});
before(function setLoginFunctions() {
    this.login = async (user = this.testData.user) => {
        return this.api.post('/login')
            .send({
                email: user.email,
                password: user.password
            })
            .expect(200)
            .then(res => {                
                const { user_name } = res.body.data.user;
                expect(user_name).to.equal(this.testData.user.user_name);
            });
    };
    this.logout = async () => {
        return this.api.post('/login')
            .send()
            .expect(200);
    };
    this.addTestUserAndLogin = (user = this.testData.user) => this.addTestUser(user).then(() => this.login(user));
});
before(function setAddVisualizationFunction() {
    this.addVisualization = async (visualization = this.testData.visualizationStandard, visualizationType = 'standard') => {
        return this.api
            .post('/visualization')
            .send({
                visualizationType,
                ...visualization
            })
            .expect(200)
            .expect(res => expect(res.body.data.visualizationId).to.be.a('string'));
    };
});
beforeEach(async function emptyCollections() {
    await User.find().remove();
    await SignupVerification.find().remove();
    return;
});
beforeEach(function setTestData() {
    this.testData = getTestData();
});

after(function disconnectDatabase(done) {
    mongoose.disconnect(done);
})
