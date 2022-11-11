const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();
const getPool = require("../../database");
const bodyParser = require('body-parser');

const Luraph = require("luraph").Luraph;
const api = new Luraph(process.env.LURAPH_API_TOKEN);

apiRouter.use(bodyParser.urlencoded({ extended: true }));

const deleteLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 1,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/script/:script_id', deleteLimiter);

apiRouter.delete("/script/:script_id", async (req, res, next) => {

    const apiKey = req.get('Authorization');
    const scriptId = req.params.script_id;

    const pool = await getPool().getConnection();

    const [apiKeyInfo, apiRows] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);
    const [script, scriptRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = ${scriptId}`);

    if (apiKeyInfo.length === 0) {
        return res.status(401).json({
            "message": "Invalid API Key"
        });
    }

    if (script.length === 0) {
        return res.status(400).json({
            "message": "Invalid Script ID"
        });
    }

    try {
        await pool.query(`DELETE FROM script_storage WHERE script_id = ${scriptId}`);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            "message": "Something went wrong with the Database, please contact the Developer to fix this",
        });
    }

    return res.status(200).json({
        "message": "Successfully deleted script"
    });
});

module.exports = apiRouter;