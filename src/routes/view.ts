import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import Song, { SongDoc, SongData } from "../models/Song";
import * as passportConfig from "../config/passport";


export const getViewStandard = (req: Request, res: Response) => {
    res.render("view/standard", {
        title: "Standard"
    });
};

const router = Router();
router.get("/standard", getViewStandard);

export default router;