const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Display registration page
router.get('/register', (req, res) => {
    res.render('registration'); // Render the registration.pug template
});

// Register a user
router.post('/register', userController.register);

// Display login page
router.get('/login', (req, res) => {
    res.render('login'); // Render the login.pug template
});

// Login a user
router.post('/login', userController.login);

module.exports = router;
// Link Buyers to Properties
app.post('/link-buyers', (req, res) => {
    const { buyerId, propertyId } = req.body;
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const listings = JSON.parse(fs.readFileSync(listingsFile));

    const buyer = users.find(user => user.id === buyerId);
    const property = listings.find(listing => listing.id === propertyId);

    if (!buyer || !property) {
        return res.render('dashboard-agent', { error: 'Invalid buyer or property.' });
    }

    // Add the deal or update properties as per your logic
    console.log(`Linked Buyer ${buyerId} to Property ${propertyId}`);

    // Example: Update activeDeals
    if (!buyer.activeDeals) buyer.activeDeals = []; // Ensure activeDeals exists
    buyer.activeDeals.push({ propertyId, agentId: req.session.user.id }); // Use the agent ID from session

    // Save changes if needed
    fs.writeFileSync(userDataFile, JSON.stringify(users, null, 2));
    fs.writeFileSync(listingsFile, JSON.stringify(listings, null, 2));

    res.redirect('/dashboard-agent?firstName=' + encodeURIComponent(req.session.user.firstName));
});
// Agent Dashboard Route
app.get('/dashboard-agent', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'agent') {
        return res.redirect('/login'); // Ensure user is logged in and an agent
    }
    const firstName = req.query.firstName;
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const listings = JSON.parse(fs.readFileSync(listingsFile));

    // Get linked buyers and properties available for the agent
    const agent = users.find(user => user.email === req.session.user.email);
    const linkedBuyers = agent.linkedBuyers || [];
    const availableProperties = listings.filter(property => !property.assignedAgent); // Filter available properties

    // Get active deals
    const activeDeals = linkedBuyers.reduce((deals, buyerId) => {
        const buyerDeals = listings.filter(property => property.savedBy.includes(buyerId));
        return deals.concat(buyerDeals.map(property => ({ propertyId: property.id })));
    }, []);

    res.render('dashboard-agent', { user: { firstName }, linkedBuyers, availableProperties, activeDeals });
});

// Link Buyers to Properties
app.post('/link-buyers', (req, res) => {
    const { buyerId, propertyId } = req.body;
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const listings = JSON.parse(fs.readFileSync(listingsFile));

    const buyer = users.find(user => user.id === buyerId);
    const property = listings.find(listing => listing.id === propertyId);

    if (!buyer || !property) {
        return res.render('dashboard-agent', { error: 'Invalid buyer or property.' });
    }

    // Update the linked buyers and properties
    property.savedBy.push(buyerId); // Assuming properties have a savedBy array to track interested buyers
    property.assignedAgent = req.session.user.email; // Link property to the agent

    fs.writeFileSync(userDataFile, JSON.stringify(users, null, 2));
    fs.writeFileSync(listingsFile, JSON.stringify(listings, null, 2));

    res.redirect('/dashboard-agent?firstName=' + encodeURIComponent(req.session.user.firstName));
});
