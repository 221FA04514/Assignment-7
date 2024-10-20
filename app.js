require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt'); // For password encryption
const multer = require('multer');
const path = require('path');

// MongoDB models
const User = require('./models/User');
const Property = require('./models/Property');

const app = express();

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Static files and body parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware for user login management
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    })
);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Multer setup for file upload
const upload = multer({
    dest: 'public/assets/img/',
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, and .jpeg formats allowed!'));
        }
    }
});


// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// About Us route
app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'aboutus.html'));
});

// Registration route
app.get('/register', (req, res) => {
    res.render('registration');
});

app.post('/users/register', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('registration', { error: 'User already exists. Please login.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.redirect('/success');
    } catch (error) {
        console.error('Error during registration:', error);
        res.render('registration', { error: 'An error occurred during registration.' });
    }
});

// Success route
app.get('/success', (req, res) => {
    res.render('success');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Save user data in session
        req.session.user = {
            firstName: user.firstName,
            email: user.email,
            role: user.role
        };

        // Redirect based on user role
        if (user.role === 'seller') {
            res.redirect(`/dashboard-seller`);
        } else if (user.role === 'buyer') {
            res.redirect(`/dashboard-buyer`);
        } else if (user.role === 'agent') {
            res.redirect(`/dashboard-agent`);
        } else {
            res.render('login', { error: 'Unknown role. Please contact support.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.render('login', { error: 'An error occurred during login.' });
    }
});

// Buyer Dashboard
app.get('/dashboard-buyer', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'buyer') {
        return res.redirect('/login');
    }

    const listings = await Property.find({});
    const { location, budget } = req.query;
    let filteredProperties = listings;

    if (location) {
        filteredProperties = filteredProperties.filter(property =>
            property.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (budget) {
        filteredProperties = filteredProperties.filter(property => property.price <= parseFloat(budget));
    }

    res.render('dashboard-buyer', { user: req.session.user, properties: filteredProperties });
});

// Seller Dashboard
app.get('/dashboard-seller', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') {
        return res.redirect('/login');
    }

    const sellerEmail = req.session.user.email;
    const sellerProperties = await Property.find({ sellerEmail });

    res.render('dashboard-seller', { user: req.session.user, properties: sellerProperties });
});

// Agent Dashboard
// Agent Dashboard
app.get('/dashboard-agent', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'agent') {
        return res.redirect('/login');
    }

    const listings = await Property.find({});
    const activeDeals = []; // Initialize activeDeals to an empty array

    res.render('dashboard-agent', {
        user: req.session.user,
        availableProperties: listings,
        activeDeals // Pass activeDeals to the template
    });
});

app.post('/properties/add', upload.single('propertyImage'), async (req, res) => {
    const { title, location, price } = req.body;
    let imageUrl = null;

    if (req.file) {
        imageUrl = `/assets/img/${req.file.filename}`;
        console.log('Uploaded Image URL:', imageUrl); // Check if image URL is generated correctly
    } else {
        console.log('No file uploaded.'); // Check if no file was uploaded
    }

    const sellerEmail = req.session.user.email;
    const newProperty = new Property({
        title,
        location,
        price,
        imageUrl, // Ensure this is set correctly
        sellerEmail
    });

    try {
        await newProperty.save();
        console.log('Saved Property:', newProperty); // Log saved property
        res.redirect('/dashboard-seller');
    } catch (error) {
        console.error('Error adding property:', error);
        res.render('dashboard-seller', { error: 'An error occurred while adding the property.' });
    }
});



// Profile Edit route
app.get('/profile/edit', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ email: req.session.user.email });
        res.render('profile-edit', { user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.render('profile-edit', { error: 'An error occurred while fetching the profile.' });
    }
});

// Profile Update route
app.post('/profile/update', upload.single('profilePicture'), async (req, res) => {
    const { firstName, lastName, phone } = req.body;

    try {
        const updateData = { firstName, lastName, phone };

        // Check if file is uploaded for profile picture
        if (req.file) {
            updateData.profilePicture = `/assets/img/${req.file.filename}`;
        }

        await User.updateOne(
            { email: req.session.user.email },
            updateData
        );

        req.session.user.firstName = firstName; // Update session data
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.render('profile-edit', { error: 'An error occurred while updating the profile.' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
