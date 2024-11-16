const express = require('express');
const app = express();

app.use(express.static('public', path.join(__dirname, 'public')));