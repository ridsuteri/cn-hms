// Import necessary modules
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userController = require('../controllers/userController');

const router = express.Router();

// JWT secret key
const secretKey = process.env.JWT_SECRET; // Use environment variable

// CREATE - POST /users (Sign up)
router.post('/', userController.signup);

// LOGIN - POST /login (Generate JWT token)
router.post('/login', userController.signin);

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// READ - GET /users (Protected)
router.get('/', authenticateJWT, userController.getAllUsers);

// READ - GET /users/:id (Protected)
router.get('/currentUser', authenticateJWT, userController.getUserDetail);

// UPDATE - PUT /users/:id (Protected)
router.put('/:id', authenticateJWT, userController.updateUser);

// DELETE - DELETE /users/:id (Protected)
router.delete('/:id', authenticateJWT, userController.deleteUser);

module.exports = router;