// backend/controllers/userController.js

const User = require('../models/userModel'); 
const jwt = require('jsonwebtoken');

// Sign up controller
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: 'User signed up successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Sign in controller
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.isValidPassword(password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'User signed in successfully', token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Signin Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserDetail = async (req, res) =>{
  try {
      console.log('incoming user request', req.user);
      const user = await User.findOne({_id: req.user.id});
      res.status(200).json({email: user.email});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) =>{
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
  try {
    // check for the token, and check it's role
    // if it's role is admin
    // allow deleting/updating record ...
    // if not an admin, check if the email id in token is the same record which user is trying to alte
      const user = await User.findOneAndUpdate({email:req.params.email}, req.body, { new: true });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

exports.deleteUser =  async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedRecord = await User.findByIdAndDelete(userId);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};