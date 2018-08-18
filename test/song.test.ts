process.env["TEST_SUITE"] = "song";

import request from "supertest";
import app from "../src/app";
import { EDESTADDRREQ } from "constants";

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
    it("should respond with 200 and song", () => {
        mockLogin();
        return request(app).post("/song")
            .send({
                name: "mysongname22",
                type: "composition",
                mp3Link: "https://example.org/mp3",
                midLink: "https://example.org/mid",
                visualizations: [{
                    visualizationType: "standard",
                    visualization: "5b741d288b95041d9c171aab"
                }, {
                    visualizationType: "standard",
                    visualization: "5b741d288b95041d9c171aaa"
                }]
            })
            .expect(200)
            .expect(res => expect(res).not.to.be.undefined);
    });
    it("should respond with 400 given invalid arguments", () => {
        mockLogin();
        return request(app).post("/song")
            .expect(400)
            .expect(res => expect(res).not.to.be.undefined);
    });
});
