import async, { nextTick } from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { Types, Mongoose, Document } from "mongoose";
import Song, { SongDoc, SongData, songSchemaValidator } from "../models/Song";
import { checkSchema, ValidationSchema } from "express-validator/check";
import Visualization from "../models/Visualization";
import { ObjectId } from "bson";
import { resolve } from "url";
import * as passportConfig from "../config/passport";


const router = Router();

export let postSong = [passportConfig.isAuthenticated, checkSchema(songSchemaValidator), (req: Request, res: Response, next: NextFunction) => {
    const errors = req.validationErrors();

    if (errors) {
        req.flash("errors", errors);
        return res.status(400).send(errors);
    }

    return new Promise((resolve, reject) => resolve(getSongDataFromRequest(req)))
        .then(checkSongConflictsPreSaving)
        .then(saveSong)
        .then(savedSong => res.status(200).send(savedSong))
        .catch(error => {
            if (error.message === "song name conflict") {
                return res.status(409).send({ error });
            }
            return error;
        })
        .catch(next);
}];

function getSongDataFromRequest(req: Request): SongData {
    const {
        body: { name, type, mp3Link, midLink, visualizations },
        user: { id: userId }
    } = req;

    const songData: SongData = { name, type, mp3Link, midLink, visualizations, userId: Types.ObjectId(userId) };

    if (req.body.pdfLink) {
        songData.pdfLink = req.body.pdfLink;
    }
    if (req.body.externalSonglink) {
        songData.externalSonglink = req.body.externalSonglink;
    }

    return songData;
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

router.use(...postSong);

export default router;