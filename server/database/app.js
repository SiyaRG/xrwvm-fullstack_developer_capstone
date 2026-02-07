const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const dealerships = require('./dealership');
const reviews = require('./review');
const inventory = require('./inventory');

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/dealership_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
    loadInitialData();
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Load initial data from JSON files if database is empty
async function loadInitialData() {
    try {
        // Load dealerships
        const dealershipCount = await dealerships.countDocuments();
        if (dealershipCount === 0) {
            const dealershipData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/dealerships.json'), 'utf8'));
            await dealerships.insertMany(dealershipData.dealerships);
            console.log('Dealerships data loaded');
        }

        // Load reviews
        const reviewCount = await reviews.countDocuments();
        if (reviewCount === 0) {
            const reviewData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reviews.json'), 'utf8'));
            await reviews.insertMany(reviewData.reviews);
            console.log('Reviews data loaded');
        }

        // Load car inventory
        const inventoryCount = await inventory.countDocuments();
        if (inventoryCount === 0) {
            const inventoryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/car_records.json'), 'utf8'));
            await inventory.insertMany(inventoryData.cars);
            console.log('Inventory data loaded');
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// API Endpoints

// Get all dealers
app.get('/fetchDealers', async (req, res) => {
    try {
        const dealerList = await dealerships.find({});
        res.json(dealerList);
    } catch (error) {
        console.error('Error fetching dealers:', error);
        res.status(500).json({ error: 'Failed to fetch dealers' });
    }
});

// Get dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const dealerList = await dealerships.find({ state: state });
        res.json(dealerList);
    } catch (error) {
        console.error('Error fetching dealers by state:', error);
        res.status(500).json({ error: 'Failed to fetch dealers by state' });
    }
});

// Get specific dealer
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dealer = await dealerships.findOne({ id: parseInt(id) });
        if (!dealer) {
            return res.status(404).json({ error: 'Dealer not found' });
        }
        res.json(dealer);
    } catch (error) {
        console.error('Error fetching dealer:', error);
        res.status(500).json({ error: 'Failed to fetch dealer' });
    }
});

// Get dealer reviews
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reviewList = await reviews.find({ dealership: parseInt(id) });
        res.json(reviewList);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Insert new review
app.post('/insert_review', async (req, res) => {
    try {
        const reviewData = req.body;
        const newReview = new reviews(reviewData);
        await newReview.save();
        res.json({ success: true, review: newReview });
    } catch (error) {
        console.error('Error inserting review:', error);
        res.status(500).json({ error: 'Failed to insert review' });
    }
});

// Get inventory by dealer
app.get('/fetchInventory/dealer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryList = await inventory.find({ dealer_id: parseInt(id) });
        res.json(inventoryList);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Dealer API Server is running',
        endpoints: [
            'GET /fetchDealers',
            'GET /fetchDealers/:state',
            'GET /fetchDealer/:id',
            'GET /fetchReviews/dealer/:id',
            'POST /insert_review',
            'GET /fetchInventory/dealer/:id'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Dealer API Server running on port ${PORT}`);
});