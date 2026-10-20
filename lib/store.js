const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { buildData } = require('./seed');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data', 'progress.json');
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'upsc_tracker';
const COLLECTION = 'progress';
const DOC_ID = 'main';

let mongoClient;

async function getMongoCollection() {
  if (!MONGODB_URI) return null;

  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }

  return mongoClient.db(DB_NAME).collection(COLLECTION);
}

function readFileData() {
  if (!fs.existsSync(DATA_PATH)) {
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const seed = buildData();
    fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }

  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeFileData(data) {
  const dataDir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function readData() {
  const collection = await getMongoCollection();
  if (!collection) {
    return readFileData();
  }

  const doc = await collection.findOne({ _id: DOC_ID });
  if (!doc) {
    const seed = buildData();
    await collection.insertOne({ _id: DOC_ID, classes: seed.classes });
    return seed;
  }

  return { classes: doc.classes };
}

async function writeData(data) {
  const collection = await getMongoCollection();
  if (!collection) {
    writeFileData(data);
    return;
  }

  await collection.updateOne(
    { _id: DOC_ID },
    { $set: { classes: data.classes } },
    { upsert: true }
  );
}

module.exports = { readData, writeData };
