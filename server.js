require("dotenv").config();

const stripeSecretKey = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;


const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); // handling file uploads
const path = require('path');
const app = express();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Connection URI
const uri = 'mongodb+srv://manenhle:<password>@homeaffairsapp.ylmy6km.mongodb.net/?retryWrites=true&w=majority&appName=HomeAffairsApp';


// Define a GET endpoint for birth reg.
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const port = 5000;

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing application/json
app.use(bodyParser.json());

// Multer middleware to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to handle form submission
app.post('/public/birth.html', upload.fields([{ name: 'proofID' }, { name: 'marriageCertificate' }, { name: 'birthNotification' }]), (req, res) => {
    // Handle form data here
    const childName = req.body.name;
    const gender = req.body.gender;
    const placeOfBirth = req.body.placeOfBirth;
    const dateOfBirth = req.body.dateOfBirth;
    const maternalName = req.body.maternalName;
    const maternalId = req.body.maternalId;
    const maternalPlaceOfBirth = req.body.maternalPlaceOfBirth;
    const maternalDateOfBirth = req.body.maternalDateOfBirth;
    const paternalName = req.body.paternalName;
    const paternalId = req.body.paternalId;
    const paternalPlaceOfBirth = req.body.paternalPlaceOfBirth;
    const paternalDateOfBirth = req.body.paternalDateOfBirth;
    const userID = req.body.userID;

    // Handle uploaded files
    const proofIDFiles = req.files['proofID'];
    const marriageCertificateFiles = req.files['marriageCertificate'];
    const birthNotificationFiles = req.files['birthNotification'];

    // Save files to storage or database
    // For simplicity, we're just logging the file paths here
    if (proofIDFiles) {
        proofIDFiles.forEach(file => {
            console.log('Proof of Identity Document:', file.path);
        });
    }
    if (marriageCertificateFiles) {
        marriageCertificateFiles.forEach(file => {
            console.log('Marriage Certificate:', file.path);
        });
    }
    if (birthNotificationFiles) {
        birthNotificationFiles.forEach(file => {
            console.log('Birth Notification:', file.path);
        });
    }

    // Generate a unique ID for the submission
    const submissionID = uuidv4();

    // Respond with a success message or handle errors
    res.status(200).send({ message: 'Form submitted successfully', submissionID });
});
//end api birth reg.


//connnect to MongoDB
mongoose.connect('mongodb://localhost:27017/birth_registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Schema
const birthSchema = new mongoose.Schema({
  name: String,
  gender: String,
  placeOfBirth: String,
  dateOfBirth: Date,
  maternalName: String,
  maternalId: String,
  maternalPlaceOfBirth: String,
  maternalDateOfBirth: Date,
  paternalName: String,
  paternalId: String,
  paternalPlaceOfBirth: String,
  paternalDateOfBirth: Date,
  proofID: String, 
  marriageCertificate: String,
  birthNotification: String,
  userID: String
});

const BirthModel = mongoose.model('Birth', birthSchema);

// Handle form submission
app.post('/public/birth.html', multer().none(), async (req, res) => {
  try {
    const formData = req.body;
    const newRecord = new BirthModel(formData);
    await newRecord.save();
    res.status(201).send('Data inserted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/*
// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to the MongoDB server
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

// Call the function to connect
connectToMongoDB();

// Get the database
const db = client.db();

async function registerUser(username, email, password) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert a new user document into the collection
        await db.collection('users').insertOne({ username, password: hashedPassword });
        console.log('User registered successfully');
    } catch (err) {
        console.error('Error registering user:', err);
    } finally {
        await client.close();
    }
}

async function authenticateUser(username, password) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        // Retrieve user document based on email
        const user = await db.collection('users').findOne({ username });
        if (!user) {
            console.log('User not found');
            return;
        }
        // Compare hashed passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            console.log('User authenticated successfully');
        } else {
            console.log('Invalid password');
        }
    } catch (err) {
        console.error('Error authenticating user:', err);
    } finally {
        await client.close();
    }
}

// Example usage:
registerUser('john_doe', 'password123');
authenticateUser('john_doe', 'password123');

// Insert a document into a collection
async function insertDocument() {
    try {
        const result = await db.collection('mycollection').insertOne({ name: 'John', age: 30 });
        console.log('Document inserted:', result.insertedId);
    } catch (err) {
        console.error('Error inserting document:', err);
    }
}

// Call the function to insert a document
insertDocument();

// Close the MongoDB connection
async function closeMongoDBConnection() {
    try {
        await client.close();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    }
}

// Call the function to close the connection
closeMongoDBConnection();


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static('public'));

const appServices = new Map([
    [1, { priceInCents: 40000, name: "Birth Registration"}],
    [2, { priceInCents: 7500, name: "Death Registration"}],
    [3, { priceInCents: 0, name: "ID Registration"}]
]);

app.post('/payment.html', async (req, res) => {
    try {
        const session = await stripeSecretKey.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/home.html`,
            line_items: req.body.items.map(item => {
                const storeItem = appServices.get(item.id)
                return {
                    price_data: {
                        currency: 'zar',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }    
});*/

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
