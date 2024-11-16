const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, '/images')));


app.get('/', express.static(path.join(__dirname, '/index.html')));
app.all((req, res) => {
    res.status(404).json({
        success: false,
        status: 404,
        message: 'Page not found',
    });
});

app.use((err, req, res, next) => {
    let errorStatus = err.status || 500;
    let errorMessage = err.message || 'Something went wrong!';
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});

app.listen(8800, () => {
    console.log('Backend server is running!');
});