require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Use environment variable for Google client ID

// MongoDB connection with error handling
mongoose.connect('mongodb://localhost:27017/wavefy_hosting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((error) => console.error('MongoDB connection error:', error));

// Define the user schema
const UserSchema = new mongoose.Schema({
  nickname: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
});

const User = mongoose.model('User', UserSchema);

app.use(bodyParser.json());

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { nickname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ nickname, email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'Sign up successful!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).send({ message: 'Error signing up. Please try again later.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password); // Validate the password
    if (!validPassword) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY); // Use environment variable for JWT secret
    res.send({ token, email: user.email, nickname: user.nickname });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).send({ message: 'Error logging in. Please try again later.' });
  }
});

// Google Sign-In route
app.post('/google-signin', async (req, res) => {
  try {
    const { id_token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({ nickname: payload.name, email: payload.email, googleId: payload.sub });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
    res.send({ token, email: user.email, nickname: user.nickname });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(400).send({ message: 'Error with Google sign-in. Please try again later.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
