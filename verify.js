const express = require('express');

const protecRoute = express.Router();

const appToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

protecRoute.use((req, res, next) => {
	const token = req.headers.authorization ? req.headers.authorization.split(" ")[ 1 ] : null
    if (token === appToken) next();
    else return res.status(401).json({ error: 401, msg: 'Unauthorized' });
});

module.exports = protecRoute;