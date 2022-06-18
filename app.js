const express = require("express");
const router = express.Router();
const methodoverride = require("method-override");
const bodyparser = require("body-parser");
const cors = require('cors');
const verify = require('./verify');

const axios = require('axios');

const users = require('./users.json');
const properties = require('./properties.json');
const cars = require('./cars.json');

const app = express();

const crypto = require('crypto');
const base64url = require("base64url");
const randomstring = require("randomstring");
const url = require('url');

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

router.route('/car/:id')
    .get(verify, (req, res) => {
        if (cars[req.params.id-1]) {
            return res.status(200).jsonp({ msg: 'ok', data: cars[req.params.id-1] });
        }
        res.status(400).jsonp({ error: 400, msg: 'car not found' });
    });

/* router.route('/')
    .get((req, res) => {
        console.log('-->', req.query.state);
        if (req.query.code) {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', req.query.code);
            params.append('client_id', '237n2282ge6ot4tr1ip15eg0j9');
            params.append('redirect_uri', 'http://localhost:8080');

            const buff = new Buffer.from('237n2282ge6ot4tr1ip15eg0j9:14qr47hdpp8roajnpksedh1ft5j5bp6c4j9oir4ubothdsjp3o3p');
            const base64data = buff.toString('base64');
            axios.post('https://login.imjose.app/oauth2/token', params, {
                headers: {
                    Authorization: `Basic ${base64data}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(response => {
                    res.status(200).jsonp({ statusCode: 200, data: response.data });
                })
                .catch(error => {
                    console.log('--->', error.response)
                    if (error.response?.data?.error === 'invalid_grant') return res.status(400).jsonp({ statusCode: 401, data: 'unauthorized' });
                    console.log(error.response?.data);
                    return res.status(400).jsonp({ statusCode: 200, data: 'internal error' });
                });
        }
        else res.status(400).jsonp({ statusCode: 400, msg: 'bad request' });
    }); */


    global.state = null;
    global.codeVerifier = null;

    const clientId = '778b93ip0e9qp5k07ftjojnidb';

    app.disable('etag');

    router.route('/login')
    .get((req, res) => {
        state = randomstring.generate(128);
        codeVerifier = randomstring.generate(128);

        console.log('-222-->', state, codeVerifier);
        
        // client_id: 778b93ip0e9qp5k07ftjojnidb
        return res.redirect(302, url.format({
            protocol: 'https',
            host: 'login.imjose.app',
            pathname: '/oauth2/authorize',
            query: {
                response_type: 'code',
                client_id: clientId,
                redirect_uri: 'http://localhost:8080/auth',
                // scope: 'openid',
                state: state,
                code_challenge: base64url.fromBase64(crypto.createHash('sha256').update(codeVerifier).digest('base64')),
                code_challenge_method: 'S256'
            },
        }));
        // res.status(200).jsonp({ statusCode: 200, data: 'ey' });
    });

router.route('/auth')
    .get((req, res) => {
        if (req.query.code && req.query.state && req.query.state === state) {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', req.query.code);
            params.append('client_id', clientId);
            params.append('redirect_uri', 'http://localhost:8080/auth');
            params.append('code_verifier', codeVerifier);

            const buff = new Buffer.from(`${clientId}:${req.query.code}`);
            const base64data = buff.toString('base64');
            axios.post('https://login.imjose.app/oauth2/token', params, {
                headers: {
                    // Authorization: `Basic ${base64data}:`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(response => {
                    res.status(200).jsonp({ statusCode: 200, data: response.data });
                })
                .catch(error => {
                    console.log(error.response?.data);
                    if (error.response?.data?.error === 'invalid_grant') return res.status(400).jsonp({ statusCode: 401, data: 'unauthorized' });
                    return res.status(400).jsonp({ statusCode: 200, data: 'internal error' });
                });
        }
        else res.status(400).jsonp({ statusCode: 400, msg: 'bad request' });
    });

    router.route('/')
        .get((req, res) => {
            res.status(200).jsonp({ statusCode: 200, data: 'ok' });
        });

/* router.route('/')
    .get((req, res) => {
        console.log('-->', req.query.state);
        if (req.query.code) {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', req.query.code);
            params.append('client_id', '237n2282ge6ot4tr1ip15eg0j9');
            params.append('redirect_uri', 'http://localhost:8080');

            const buff = new Buffer.from('237n2282ge6ot4tr1ip15eg0j9:14qr47hdpp8roajnpksedh1ft5j5bp6c4j9oir4ubothdsjp3o3p');
            const base64data = buff.toString('base64');
            axios.post('https://login.imjose.app/oauth2/token', params, {
                headers: {
                    Authorization: `Basic ${base64data}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(response => {
                    res.status(200).jsonp({ statusCode: 200, data: response.data });
                })
                .catch(error => {
                    console.log('--->', error.response)
                    if (error.response?.data?.error === 'invalid_grant') return res.status(400).jsonp({ statusCode: 401, data: 'unauthorized' });
                    console.log(error.response?.data);
                    return res.status(400).jsonp({ statusCode: 200, data: 'internal error' });
                });
        }
        else res.status(400).jsonp({ statusCode: 400, msg: 'bad request' });
    }); */



// Error 404
router.use(function (req, res, next) {
    return res.status(404).json({ error: 404, message: 'Not found' });
});


app.listen(8080, () => {
  console.log('Listening... http://localhost:8080');
});

