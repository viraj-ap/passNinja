const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const crypto = require('crypto');

dotenv.config();

// Connection URL and Mongo Client
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'passNinja';

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 4000;

// Encryption settings
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || '12345678901234567890123456789012').slice(0, 32); // Ensure 32-byte key
const IV_LENGTH = 16;

// Encryption function
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decryption function
function decrypt(text) {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Connect and start server
async function start() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection('passwords');

        // GET all passwords
        app.get('/', async (req, res) => {
            try {
                const passwords = await collection.find({}).toArray();
                const decryptedPasswords = passwords.map(pass => ({
                    ...pass,
                    password: decrypt(pass.password)
                }));
                res.json(decryptedPasswords);
            } catch (err) {
                console.error("Error fetching passwords:", err);
                res.status(500).send({ message: "Error fetching passwords" });
            }
        });

        // POST a password
        app.post('/', async (req, res) => {
            try {
                const passwordData = req.body;
                const encryptedData = {
                    ...passwordData,
                    password: encrypt(passwordData.password),
                };
                const insertResult = await collection.insertOne(encryptedData);
                res.send({ success: true, result: insertResult });
            } catch (err) {
                console.error("Error saving password:", err);
                res.status(500).send({ message: "Error saving password" });
            }
        });

        // DELETE a password by id
        app.delete('/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
                if (deleteResult.deletedCount === 1) {
                    res.status(200).send({ message: 'Password deleted successfully' });
                } else {
                    res.status(404).send({ message: 'Password not found' });
                }
            } catch (err) {
                console.error("Error deleting password:", err);
                res.status(500).send({ message: "Error deleting password" });
            }
        });

        // Start Express server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

start();
