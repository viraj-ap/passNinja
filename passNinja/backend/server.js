const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

dotenv.config();

// Connection URL
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'passNinja';
const app = express();
app.use(cors());
const port = process.env.PORT || 4000;
app.use(bodyParser.json());

client.connect();

// get all the passwords
app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
});

// save a password
app.post('/', async (req, res) => {
    const password = req.body;
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const insertResult = await collection.insertOne(password);
    res.send({ success: true, result: insertResult });
});

// delete a password by id
app.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    try {
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 1) {
            res.status(200).send({ message: 'Password deleted successfully' });
        } else {
            res.status(404).send({ message: 'Password not found' });
        }
    } catch (error) {
        console.error("Error deleting password:", error);
        res.status(500).send({ message: 'Error deleting password' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
