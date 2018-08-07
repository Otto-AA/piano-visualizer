const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError, invalidCredentialsError, invalidArgumentsError, loginRequiredError } = require('./Response');

describe('Integration test: API', function () {
    
    describe('Signup Process', async function () {
        it('POST /signup should get verification_id and verify user with it', async function () {
            const testUser = this.testData.user;

            // Get verification_id
            const verification_id = await this.api
                .post('/signup')
                .send(testUser)
                .expect(200)
                .expect(res => expect(res.body.data.verification_id).to.be.a('string'))
                .then(res => res.body.data.verification_id);

            // Verify user
            return this.api
                .post('/verify_signup')
                .send({ verification_id })
                .expect(200)
                .expect(res => {
                    const { user_id, user_name } = res.body.data.user;
                    expect(user_id).to.equal(testUser.user_id);
                    expect(user_name).to.equal(testUser.user_name);
                });
        });
        it('POST /signup should respond with 400 given invalid input', async function () {
            let invalidInput = this.testData.user;
            delete invalidInput.email;

            return this.api
                .post('/signup')
                .send(invalidInput)
                .expect(400)
                .expect(res => expect(res.body.message).to.equal('Invalid arguments'));
        });
        it('POST /signup should respond with 409 if user already exists', async function () {
            // Add test user to database
            await this.addTestUser();

            // Try to signup with the same user data
            return this.api
                .post('/signup')
                .send(this.testData.user)
                .expect(409)
                .expect(res => expect(res.body.message).to.equal('username or email already in use'));
        });
        it('POST /verify_signup should return 400 given an invalid verification_id', async function () {
            return this.api
                .post('/verify_signup')
                .send({ verification_id: 'invalid' })
                .expect(400);
        });
    });

    describe('Login', function () {
        it('POST /login should respond with 200 given valid login credentials', async function () {
            await this.addTestUser();

            return this.api
                .post('/login')
                .send({
                    email: this.testData.user.email,
                    password: this.testData.user.password
                })
                .expect(200)
                .expect(res => expect(res.body.data.user.user_name).to.equal(this.testData.user.user_name));
        });
        it('POST /login should respond with 401 given invalid login credentials', async function () {
            return this.api
                .post('/login')
                .send({
                    email: 'invalid',
                    password: '1234'
                })
                .expect(401)
                .expect(res => expect(res.body).to.deep.equal(invalidCredentialsError));
        });
    });

    describe('Logout', function () {
        it('POST /logout should return 200 and 401 on GET /current_user', async function () {
            // Ensure the user is logged in before testing logout
            await this.addTestUserAndLogin();

            // Logout
            await this.api
                .post('/logout')
                .expect(200);

            // Test if /current_user (which requires to be logged in) throws 401
            return this.api
                .get('/current_user')
                .expect(401)
                .expect(res => expect(res.body).to.deep.equal(loginRequiredError));
        });
    });

    describe('GET /current_user', function () {
        it('GET /current_user should respond with 200 and test user', async function () {
            await this.addTestUserAndLogin();

            return this.api
                .get('/current_user')
                .expect(200)
                .expect(res => expect(res.body.data.user.user_name).to.equal(this.testData.user.user_name));
        });
        it('GET /current_user should respond with 401 without login', async function () {
            await this.addTestUser();

            return this.api
                .get('/current_user')
                .expect(401)
                .expect(res => expect(res.body).to.deep.equal(loginRequiredError));
        });
    });

    describe('GET /user', function () {
        it('GET /user should respond with 200 and test user', async function () {
            await this.addTestUser();
    
            return this.api.get('/user')
                .query({ user_id: this.testData.user.user_id })
                .expect(200)
                .expect(res => {
                    const { user_id, user_name, email, password } = res.body.data.user;
                    expect(user_id).to.be.equal(this.testData.user.user_id);
                    expect(user_name).to.be.equal(this.testData.user.user_name);
                    expect(email).to.be.undefined;
                    expect(password).to.be.undefined;
                });
        });
        it('GET /user should respond with 404 given an nonexistent user_id', async function () {
            return this.api.get('/user?user_id=definitely_nonexisting')
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(res => expect(res.body).to.deep.equal(notFoundError));
        });
    });

    describe('DElETE /user', function() {
        it('DELETE /user should respond with 200 and prevent further logins with this user', async function () {
            await this.addTestUser();
            const credentials = {
                email: this.testData.user.email,
                password: this.testData.user.password
            };
            // Delete user
            await this.api
                .delete('/user')
                .query(credentials)
                .expect(200);

            // Test if user is deleted
            return this.api
                .post('/login')
                .send(credentials)
                .expect(401);
        });
        it('DELETE /user should respond with 401 given invalid credentials', async function () {
            return this.api
                .delete('/user')
                .query({
                    email: 'none',
                    password: 'none',
                })
                .expect(401)
                .expect(res => expect(res.body).to.deep.equal(invalidCredentialsError));
        });
    });
});
