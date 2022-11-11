const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();
const getPool = require("../../database");

const detailsLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/:api_key/details', detailsLimiter);

apiRouter.get("/:api_key/details", async (req, res, next) => {
    
    const apiKey = req.params.api_key;
    const pool = await getPool().getConnection();

    const [foundKey, keyRow] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}';`);

    if (foundKey.length === 0) {
        res.status(401).json({
            "message": "Invalid API Key.",
        });
    } else {
        const apiKey = foundKey[0];

        res.status(200).json({
            "message": "Success",
            "Key": {
                "ownerid": apiKey.discord_connecteduser,
                "expirytime": apiKey.api_expirytime,
                "apikey": apiKey.api_key,
                "maxscripts": apiKey.api_maxscripts,
                "keytype": apiKey.api_type
            }
        });
    }
});

module.exports = apiRouter;