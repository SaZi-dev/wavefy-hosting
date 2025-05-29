require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected!'))
    .catch(error => console.error('MongoDB connection error:', error));

const UserSchema = new mongoose.Schema({
    nickname: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', UserSchema);

app.use(cors()); // Allow frontend to communicate
app.use(bodyParser.json());

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { nickname, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ message: 'Email already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ nickname, email, password: hashedPassword });
        await user.save();

        res.status(201).send({ message: 'Signup successful! You can now log in.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.send({ token, email: user.email, nickname: user.nickname });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
