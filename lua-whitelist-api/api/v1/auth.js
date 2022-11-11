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
    const scriptId = req.params.script_id;
    const authkey = req.params.script_key;
    const pool = await getPool().getConnection();

    const [rawScript, rawRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = '${scriptId}'`);

    if (rawScript.length === 0) {
        return res.send("SCRIPTINVALID");
    }

    const [keyCheck, checkRows] = await pool.query(`SELECT * FROM script_storage WHERE JSON_SEARCH(script_keys, "one", "${authkey}") AND script_id = '${scriptId}'`);

    if (keyCheck.length === 0) {
        return res.send("UNAUTHENTICATED");
    }

    const FILE = Buffer.from(keyCheck[0].script, 'hex').toString('utf8');

    return res.send(FILE);
});

module.exports = apiRouter;