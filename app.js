const express = require("express");
const router = express.Router();
const methodoverride = require("method-override");
const bodyparser = require("body-parser");
const cors = require('cors');
const verify = require('./verify');

const users = require('./users.json');
const properties = require('./properties.json');
const cars = require('./cars.json');

const app = express();

app.use(cors());
app.use(router);
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));
router.use(methodoverride());

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Invalid JSON
router.use((error, req, res, next) => {
	if (error !== null){
		return res.status(401).json({ error: '401', message: 'Invalid json' });
	}
	return next();
});

router.route('/login')
    .post((req, res) => {
        if (!req.body.email || typeof req.body.email !== 'string'){
            return res.status(400).json({ error: 400, msg: '<email> is required and must be a string' });
        }
        if (!req.body.password || typeof req.body.password !== 'string') {
            return res.status(400).json({ error: 400, msg: '<password> is required and must be a string' });
        }
        if (req.body.email !== 'admin@test.com' &&  req.body.email !== 'user@test.com' || req.body.password !== 'password') {
            return res.status(401).json({ error: 401, msg: 'Unauthorized' });
        }
        if (req.body.email === 'admin@test.com') {
            return res.status(200).jsonp({
                msg: 'ok', token, data: {
                    email: req.body.email,
                    name: 'Test name',
                    role: 'admin'
            } });
        }
        res.status(200).jsonp({
            msg: 'ok', token, data: {
                email: req.body.email,
                name: 'Test name',
                role: 'user'
        } });
    });

router.route('/users')
    .get(verify, (req, res) => {
        res.status(200).jsonp({ msg: 'ok', data: users });
    })
    .post(verify, (req, res) => {
        if (req.body.first_name && req.body.last_name && req.body.email) {
            req.body.id = users.length + 1;
            users.push(req.body);
            return res.status(200).jsonp({ msg: 'ok', data: req.body });
        }
        res.status(400).jsonp({ error: 400, msg: 'params error' });
    });

router.route('/properties')
    .get(verify, (req, res) => {
        res.status(200).jsonp({ msg: 'ok', data: properties });
    });

router.route('/cars')
    .get(verify, (req, res) => {
        res.status(200).jsonp({ msg: 'ok', data: cars });
    });



// Error 404
router.use(function (req, res, next) {
    return res.status(404).json({ error: 404, message: 'Not found' });
});


app.listen(8001, () => {
  console.log('Listening... http://localhost:8001');
});

