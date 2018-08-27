import request from "supertest";
import app from "../src/app";
import { SongFactory } from "./factory/Factory";

const chai = require("chai");
const expect = chai.expect;


jest.mock("../src/config/passport");
const passportConfig: jest.Mocked<{ isAuthenticated: any }> = require("../src/config/passport");
const mockLogin = () => passportConfig.isAuthenticated.mockImplementation((req, res, next) => {
    req.user = {
        id: "5b741d288b95041d9c171aab"
    };
    return next();
});


describe("POST /song", () => {
    it("should respond with 200 and song", async () => {
        mockLogin();
        const songData = await SongFactory.getSample();
        console.log("songData", songData);
        return request(app).post("/song")
            .send(songData)
            .expect(200)
            .expect(res => expect(res).not.to.be.undefined);
    });
    it("should respond with 400 given invalid arguments", async () => {
        mockLogin();
        const invalidSongData = await SongFactory.getInvalidSample();
        console.log("invalidSongData", invalidSongData);

        return request(app).post("/song")
            .send(invalidSongData)
            .expect(400)
            .expect(res => expect(res).not.to.be.undefined);
    });
});
