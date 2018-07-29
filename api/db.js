/**
 * Database structure
 * 
 * users: {
 *   user_id: {
 *     user_name: string
 *     created_on: date
 *     email: string
 *     password: hashed string
 *   }
 * }
 * 
 * songs: {
 *   user_id: {
 *     song_id: {
 *       song_name: string
 *       song_number: integer
 *       created_on: string
 *       composers: array<string>
 *       files: {
 *         mp3: absolute url || None
 *         midi: absolute url || None
 *         pdf: absolute url || None
 *       }
 *       design: design_id
 *     }
 *   }
 * }
 * 
 * designs: {
 *   design_id: {
 *     ...
 *   }
 * }
 * 
 */

const mongodb = require('mongodb');
const client = mongodb.MongoClient;
const mongo_url = process.env.MONGO_URL;

client.connect(mongo_url, (err, db) => {
    if (err) {
        console.error('Error while connecting to database');
        throw err;
    }
    console.log('Connected to database');

    const dbo = db.db('piano-visualizer');

    const requiredCollections = ['users', 'songs', 'designs'];
    requiredCollections.forEach(collectionName => {
        dbo.createCollection(collectionName, (err, res) => {
            console.log(`Created collection ${collectionName}`);
        });
    });
});
