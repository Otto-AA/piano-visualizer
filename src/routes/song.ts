import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import Song, { SongDoc, SongData } from "../models/Song";
import * as passportConfig from "../config/passport";


export const postSong = [passportConfig.isAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => resolve(getSongDataFromRequest(req)))
        .then(validateSongData)
        .catch(error => res.status(400).send(error))
        .then(checkSongConflictsPreSaving)
        .then(saveSong)
        .then(savedSong => res.status(200).send(savedSong))
        .catch(error => {
            if (error.message === "song name conflict") {
                return res.status(409).send({ error });
            }
            return next(error);
        });
}];

function getSongDataFromRequest(req: Request): SongData {
    const userId = req.user.userId;
    return { userId, ...req.body };
}

async function validateSongData(songData: SongData): Promise<SongData> {
    const song = new Song(songData);
    return song.validate().then(() => songData);
}

async function checkSongConflictsPreSaving(songData: SongData): Promise<SongData> {
    const conflictingSongs = await Song.find({ userId: songData.userId, name: songData.name });
    if (conflictingSongs.length) {
        throw new Error("song name conflict");
    }

    return songData;
}

function saveSong(songData: SongData): Promise<SongDoc> {
    return new Promise((resolve, reject) => {
        const song = new Song(songData);
        song.save((err, savedSong: SongDoc) => {
            if (err || !savedSong) {
                return reject(err);
            }
            resolve(savedSong);
        });
    });
}


const router = Router();
router.use(...postSong);

export default router;