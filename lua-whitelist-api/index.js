const express = require("express");
const rateLimit = require("express-rate-limit");
const subdomain = require("express-subdomain");
const app = express();
const mysql = require('mysql2/promise');
const chalk = require("chalk");
const getPool = require("./database");
require('dotenv').config();

const v1Router = require("./api/router");
app.use('/v1', v1Router);

app.use(subdomain('api', v1Router));

app.get('*', (req, res, next) => {
    res.status(404).send('Invalid Endpoint');
});

app.listen(8080, async () => {
    await getPool().getConnection().then(console.log(chalk.green("[DATABASE] <==> || Successfully established a connection to the MYSQL Database Pool! || <==> [DATABASE]")));
    console.log(chalk.green(`[SERVER] <==> || Server has been initiated and put up for PORT 3000! || <==> [SERVER]`));
});