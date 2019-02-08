const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');
const PORT = process.env.PORT || 5000;

express()
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(cors())
    .use(basicAuth)
    .get('/health', (req, res) => {
        res.status(200);
        return res.json({status: 'UP'});
    })
    .post('/v1/timing-event', async (req, res) => {
        let {username, password} = req.user;
        await registerTT(username, password);
        res.status(201);
        return res.json({message: 'Created'});
    })
    .use(errorHandler)
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

//////////////

function basicAuth(req, res, next) {
    if (req.path === '/health') return next();
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({message: 'Missing Authorization Header'});
    }

    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    req.user = {username, password};

    next();
}

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') return res.status(400).json({message: err});

    return res.status(500).json({message: err.message});
}


async function registerTT(username, password) {
    if (!username) throw new Error('username should not be null');
    if (!password) throw new Error('password should not be null');

    console.log(`Registering ${moment.tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')} for ${username}...`);
    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(process.env.TIME_TRACKER_ADDRESS, {waitUntil: 'networkidle2'});
    await page.type('#ext-gen40', username);
    await page.type('#ext-gen42', password);
    await page.click('#ext-gen44');
    await browser.close()
}