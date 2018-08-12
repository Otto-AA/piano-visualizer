const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;

const express = require('express');
const { notFoundError, invalidCredentialsError, invalidArgumentsError, loginRequiredError } = require('./Response');


describe('Router: song', function () {
    describe('POST /song', function () {

        it('POST /song should respond with 200 and songId', async function () {
            await this.addTestUser()
                .then(() => this.login());

            const { visualizationId } = await this.addVisualization();

            const songData = this.testData.song;
            songData.visualizations[0].visualizationId = visualizationId;
            return this.api
                .post('/song')
                .send(songData)
                .expect(200)
                .expect(res => expect(res.body.data.songId).to.be.a('string'));
        });

        it('POST /song should respond with 400 given insufficient arguments', async function () {
            await this.addTestUser()
                .then(() => this.login());

            const songData = {
                name: 'test'
            };
            return this.api
                .post('/song')
                .send(songData)
                .expect(400);
        });
    });
    describe('GET /song', function () {
        it('GET /song should respond with 200', async function () {
            await this.addTestUser()
                .then(() => this.login());

            const { songId } = await this.addSong();

            return this.api
                .get('/song')
                .query({ songId })
                .expect(200);
        });
    });
    describe('DELETE /song', function () {
        it('DELETE /song should respond with 200 and remove song from database', async function () {
            await this.addTestUser()
                .then(() => this.login());
            
            const { songId } = await this.addSong();

            await this.api
                .delete('/song')
                .query({ songId })
                .expect(200);
            
            return this.api
                .get('/song')
                .query({ songId })
                .expect(404);
        });
    });
});
