import request from "supertest";
import { expect } from "chai";
import app from "../src/app";
import { SongFactory } from "./factory/Factory";
import { PromiseProvider } from "mongoose";


jest.mock("../src/config/passport");
const passportConfig: jest.Mocked<{ isAuthenticated: any }> = require("../src/config/passport");
const mockLogin = (userId = "5b741d288b95041d9c171aab") => passportConfig.isAuthenticated.mockImplementation((req, res, next) => {
    req.user = {
        id: userId
    };
    return next();
});


describe("POST /song", () => {
    it("should respond with 200 and song", async () => {
        const samples = await SongFactory.getValidSamples(5);
        const promises = samples.map(sample => {
            mockLogin(sample.userId);
            return request(app).post("/song")
                .send(sample)
                .expect(({ status }) => expect(status).to.be.oneOf([200, 407]));
        });
        return Promise.all(promises);
    });
    it("should respond with 400 given invalid arguments", async () => {
        const invalidSamples = await SongFactory.getInvalidSamples(5);
        const promises = invalidSamples.map(invalidSongData => {
            if (typeof invalidSongData.userId !== "string")
                return new Promise((resolve) => resolve());

            mockLogin(invalidSongData.userId);
            return request(app).post("/song")
                .send(invalidSongData)
                .expect(({ status }) => expect(status).to.be.oneOf([400, 407]));
        });
        return Promise.all(promises);
    });
});
