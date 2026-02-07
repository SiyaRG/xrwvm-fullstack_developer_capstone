const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());

// Load data from JSON files
let dealerships = [];
let reviews = [];

try {
    const dealershipData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/dealerships.json'), 'utf8'));
    dealerships = dealershipData.dealerships;
    console.log('Loaded', dealerships.length, 'dealerships');
} catch (error) {
    console.error('Error loading dealerships:', error);
}

try {
    const reviewData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reviews.json'), 'utf8'));
    reviews = reviewData.reviews;
    console.log('Loaded', reviews.length, 'reviews');
} catch (error) {
    console.error('Error loading reviews:', error);
}

// API Endpoints

// Get all dealers
app.get('/fetchDealers', (req, res) => {
    try {
        res.json(dealerships);
    } catch (error) {
        console.error('Error fetching dealers:', error);
        res.status(500).json({ error: 'Failed to fetch dealers' });
    }
});

// Get dealers by state
app.get('/fetchDealers/:state', (req, res) => {
    try {
        const { state } = req.params;
        const dealerList = dealerships.filter(dealer => dealer.state === state);
        res.json(dealerList);
    } catch (error) {
        console.error('Error fetching dealers by state:', error);
        res.status(500).json({ error: 'Failed to fetch dealers by state' });
    }
});

// Get specific dealer
app.get('/fetchDealer/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dealer = dealerships.find(dealer => dealer.id === parseInt(id));
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
app.get('/fetchReviews/dealer/:id', (req, res) => {
    try {
        const { id } = req.params;
        const reviewList = reviews.filter(review => review.dealership === parseInt(id));
        res.json(reviewList);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Insert new review
app.post('/insert_review', (req, res) => {
    try {
        const reviewData = req.body;
        reviewData.id = reviews.length + 1;
        reviews.push(reviewData);
        res.json({ success: true, review: reviewData });
    } catch (error) {
        console.error('Error inserting review:', error);
        res.status(500).json({ error: 'Failed to insert review' });
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
            'POST /insert_review'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Dealer API Server running on port ${PORT}`);
});
