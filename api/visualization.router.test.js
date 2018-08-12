const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError, invalidCredentialsError, invalidArgumentsError, loginRequiredError } = require('./Response');
/* This could be used to test the router with stubbed out functions (e.g. no call to database)
before('Load visualization router', function () {
    this.router.visualization = this.loadTestRouter('api/visualization.router');
});
*/

describe('Router: visualization', function () {
    it('POST /visualization should respond with 400 given an invalid visualization type', async function () {
        await this.addTestUser()
            .then(() => this.login());

        const data = {
            visualizationType: 'not existing type'
        };
        return this.api
            .post('/visualization')
            .send(data)
            .expect(400);
    });
    it('POST /visualization should respond with 400 given insufficient visualization data', async function () {
        await this.addTestUser()
            .then(() => this.login());

        const data = {
            visualizationType: 'standard'
        };
        return this.api
            .post('/visualization')
            .send(data)
            .expect(400);
    });
    describe('VisualizationStandard', function () {
        it('POST /visualization should respond with 200 and visualizationId', async function () {
            await this.addTestUser().then(() => this.login());
    
            const data = {
                visualizationType: 'standard',
                ...this.testData.visualizationStandard
            };

            return this.api
                .post('/visualization')
                .send(data)
                .expect(200)
                .expect(res => expect(res.body.data.visualizationId).to.be.a('string'));
        });
    });
});
