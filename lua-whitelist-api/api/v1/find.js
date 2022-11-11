const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();
const getPool = require("../../database");

const findLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/:scriptid', findLimiter);
apiRouter.get("/:scriptid", async (req, res, next) => {

    const apiKey = req.get('Authorization');
    const scriptId = req.params.scriptid;
    const pool = await getPool().getConnection();

    const [apiKeyInfo, apiRows] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);
    const [script, scriptRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = ${scriptId};`);

    if (apiKeyInfo.length === 0) {
        return res.status(401).json({
            "message": "Invalid API Key."
        })
    }
    if (script.length === 0) {
        return res.status(500).json({
            "message": "Failed to find the script with that ID!",
        });
    } else {
        const foundScript = script[0];
        return res.status(200).json({
            "message": "Success",
            "Script": {
                "Script ID": foundScript.script_id,
                "Script Name": foundScript.script_name,
                "Script Keys": foundScript.script_keys
            }
        });
    }
});

const findScriptsLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 2,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/scripts/:api_key', findScriptsLimiter);
apiRouter.get("/scripts/:api_key", async (req, res, next) => {
    const apiKey = req.params.api_key;
    const pool = await getPool().getConnection();

    const [apiKeyInfo, apiRows] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);
    const [totalScripts, scriptRows] = await pool.query(`SELECT * FROM script_storage WHERE script_apiowner = '${apiKey}'`);

    if (apiKeyInfo.length === 0) {
        return res.status(401).json({
            "message": "Invalid API Key."
        });
    }
    
    if (totalScripts.length === 0) {
        return res.status(500).json({
            "message": "No scripts could be found with the provided API Key",
        });
    } else {
        return res.status(200).json({
            "message": "Success",
            "Scripts": totalScripts
        });
    }
});

module.exports = apiRouter;