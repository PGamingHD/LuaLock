const express = require("express");
const rateLimit = require("express-rate-limit");
const apiRouter = express.Router();
const getPool = require("../../database");

const loaderLimiter = rateLimit({
	windowMs: 15 * 1000,
	max: 2,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/loader/:script_id/:script_key', loaderLimiter);
apiRouter.get("/loader/:script_id/:script_key", async (req, res, next) => {
    return console.log("SOMEONE TRIED TO ACCESS DEPRECATED LOADER/AUTH ENDPOINT!");
    const scriptId = req.params.script_id;
    const authkey = req.params.script_key;
    const synHeader = req.get('Syn-User-Identifier');
    const swHeader = req.get('Sw-User-Identifier');
    const krnlHeader = req.get('Krnl-Fingerprint');
    const reqIP = req.get('x-forwarded-for');
    const pool = await getPool().getConnection();

    if (!synHeader && !swHeader && !krnlHeader) {
        return res.send("NOTAUTHORIZED");
    }

    const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${scriptId}'`);

    if (rawScript.length === 0) {
        return res.send("SCRIPTINVALID");
    }

    const [keyCheck, checkRows] = await pool.query(`SELECT * FROM script_storage WHERE JSON_SEARCH(script_keys, "one", "${authkey}") AND script_id = '${scriptId}'`);

    if (keyCheck.length === 0) {
        return res.send("UNAUTHENTICATED");
    }

    const [search, searching] = await pool.query(`SELECT JSON_SEARCH('${JSON.stringify(rawScript[0].script_keys)}', 'one', '${authkey}')`);
    const keyPlace = Object.values(search[0])[0].split('.')[0];
    const [testing, testing2] = await pool.query(`SELECT JSON_EXTRACT('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}')`);
    const allowedId = Object.values(testing[0])[0]['allowed-id'];
    const scriptNote = Object.values(testing[0])[0]['note'];

    if (allowedId === "0" && synHeader) {
        await pool.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "${authkey}", "allowed-id": "${synHeader}", "note": "${scriptNote}"}' AS JSON));`);
        return res.send("WHITELISTINGID");
    } else if (allowedId === "0" && swHeader) {
        await pool.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "${authkey}", "allowed-id": "${swHeader}", "note": "${scriptNote}"}' AS JSON));`);
        return res.send("WHITELISTINGID");
    } else if (allowedId === "0" && krnlHeader) {
        await pool.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(rawScript[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "${authkey}", "allowed-id": "${krnlHeader}", "note": "${scriptNote}"}' AS JSON));`);
        return res.send("WHITELISTINGID");
    }

    if (allowedId !== synHeader && allowedId !== swHeader && allowedId !== krnlHeader) {
        return res.send("NOTCORRECTEXECUTOR");
    }

    const FILE = Buffer.from(keyCheck[0].script, 'hex').toString('utf8');

    return res.send(FILE);
});

module.exports = apiRouter;