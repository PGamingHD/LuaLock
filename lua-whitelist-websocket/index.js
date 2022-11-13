const express = require("express");
const app = express();
const chalk = require("chalk");
const getPool = require("./database");
const ws = require("ws");
const http = require("http");
require('dotenv').config();

const server = http.createServer(app);

const wss = new ws.Server({server});

wss.on('connection', (executor, req) => {
    executor.on('message', async (message) => {
        //SENDMSG-DELIVERVALUE
        const toStringMsg = message.toString('utf8').split(",")[0];
        const deliverValue = message.toString('utf8').split(",")[1];
        const deliverValueTwo = message.toString('utf8').split(",")[2];
        const pool = await getPool().getConnection();

        if (toStringMsg === "INITIATEAUTHENTICATION") {
            const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${deliverValue}'`);
            
            if (rawScript.length === 0) {
                return executor.send('INVALIDSCRIPTID');
            } else {
                return executor.send('VALIDSCRIPTID');
            }
        }

        if (toStringMsg === "REQUESTINGAUTHENTICATIONKEY") {
            const [keyCheck, checkRows] = await pool.query(`SELECT * FROM script_storage WHERE JSON_SEARCH(script_keys, "one", "${deliverValue}") AND script_id = '${deliverValueTwo}'`);

            if (keyCheck.length === 0) {
                return executor.send('INVALIDSCRIPTAUTHENTICATIONKEY');
            } else if (keyCheck[0].api_expired) {
                return executor.send('EXPIREDAPIKEYOWNER');
            } else {
                return executor.send('VALIDSCRIPTANDAUTHENTICATIONKEY');
            }
        }

        if (toStringMsg === "REQUESTINGWHITELISTCHECK") {
            const synHeader = req.headers['syn-user-identifier'];
            const krnlHeader = req.headers['Krnl-Fingerprint'];

            if (!synHeader && !krnlHeader) {
                return executor.send("NOTSUPPORTEDEXECUTORTYPE");
            }

            const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${deliverValueTwo}'`);
            const [search, searching] = await pool.query(`SELECT JSON_SEARCH('${JSON.stringify(rawScript[0].script_keys)}', 'one', '${deliverValue}')`);
            const keyPlace = Object.values(search[0])[0].split('.')[0];
            const [testing, testing2] = await pool.query(`SELECT JSON_EXTRACT('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}')`);
            const allowedId = Object.values(testing[0])[0]['allowed-id'];
            const scriptNote = Object.values(testing[0])[0]['note'];

            if (allowedId === "0" && synHeader) {
                await pool.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "${deliverValue}", "allowed-id": "${synHeader}", "note": "${scriptNote}"}' AS JSON));`);
                return executor.send("INITIATEFINALPHASE");
            } else if (allowedId === "0" && krnlHeader) {
                await pool.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "${deliverValue}", "allowed-id": "${krnlHeader}", "note": "${scriptNote}"}' AS JSON));`);
                return executor.send("INITIATEFINALPHASE");
            } else {
                return executor.send("INITIATEFINALPHASE");
            }
        }

        if (toStringMsg === "INITIATEXECUTORWLCHECK") {
            const synHeader = req.headers['syn-user-identifier'];
            const krnlHeader = req.headers['Krnl-Fingerprint'];

            const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${deliverValueTwo}'`);
            const [search, searching] = await pool.query(`SELECT JSON_SEARCH('${JSON.stringify(rawScript[0].script_keys)}', 'one', '${deliverValue}')`);
            const keyPlace = Object.values(search[0])[0].split('.')[0];
            const [testing, testing2] = await pool.query(`SELECT JSON_EXTRACT('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}')`);
            const allowedId = Object.values(testing[0])[0]['allowed-id'];

            if (allowedId !== synHeader && allowedId !== krnlHeader) {
                return executor.send("NOTCORRECTEXECUTORWLID");
            } else {
                return executor.send("FINALEXECUTORCHECKWASCORRECT");
            }
        }

        if (toStringMsg === "REQUESTINGAUTHENTICATEDLOADERSCRIPT") {
            const [rawScript, rawRow] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${deliverValue}'`);
            const script = rawScript[0].script.toString('utf8');
            
            return executor.send(script);
        }

        if (toStringMsg === "REQUESTINGHEARTBEATRN") {
            const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${deliverValueTwo}'`);

            if (rawScript.length === 0) {
                return executor.send('SCRIPTWASREMOVEDBEFORE');
            }

            const [keyCheck, checkRows] = await pool.query(`SELECT * FROM script_storage WHERE JSON_SEARCH(script_keys, "one", "${deliverValue}") AND script_id = '${deliverValueTwo}'`);

            if (keyCheck.length === 0) {
                return executor.send('SCRIPTKEYWASREMOVEDBEFORE');
            }

            if (rawScript.length !== 0 && keyCheck.length !== 0) {
                return executor.send('RECIEVEDHEARTBEATSUCCESS');
            }
        }
    });
});

server.listen(8888, async () => {
    await getPool().getConnection().then(console.log(chalk.green("[DATABASE] <==> || Successfully established a connection to the MYSQL Database Pool! || <==> [DATABASE]")));
    console.log(chalk.green(`[SERVER] <==> || WebSocket Server has been initiated and put up for PORT 8888! || <==> [SERVER]`));
});