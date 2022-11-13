const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();
const getPool = require("../../database");
const bodyParser = require('body-parser');

const Luraph = require("luraph").Luraph;
const api = new Luraph(process.env.LURAPH_API_TOKEN);

apiRouter.use(bodyParser.urlencoded({ extended: true }));

const updateLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 1,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/script/:script_id', updateLimiter);

apiRouter.put("/script/:script_id", async (req, res, next) => {

    const apiKey = req.get('Authorization');
    const scriptId = req.params.script_id;
    const newScript = req.body.script;

    const pool = await getPool().getConnection();

    const [apiKeyInfo, apiRows] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);
    const [scriptA, scriptRows] = await pool.query(`SELECT * FROM script_storage WHERE script_id = ${scriptId}`);

    if (apiKeyInfo.length === 0) {
        return res.status(401).json({
            "message": "Invalid API Key"
        });
    }

    if (apiKeyInfo[0].api_expirytime < Date.now() && !apiKeyInfo[0].api_expired) {
        await pool.query(`UPDATE user_storage SET api_expired = 1 WHERE api_key = '${apiKey}'`);

        return res.status(401).json({
            "message": "API Key expired."
        });
    }

    if (apiKeyInfo[0].api_expired) {
        return res.status(401).json({
            "message": "API Key expired."
        });
    }

    if (scriptA.length === 0) {
        return res.status(500).json({
            "message": "Invalid Script ID"
        });
    }

    if (scriptA[0].api_obfuscationsleft === 0) {
        return res.status(500).json({
            "message": "Reached max amount of obfuscations allowed this month"
        });
    }

    if (!newScript) {
        return res.status(400).json({
            "message": "Missing Parameters"
        });
    }

    const oldName = scriptA[0].script_name;

    const nodes = await api.getNodes();

    const options = {
        INTENSE_VM_STRUCTURE: true,
        ENABLE_GC_FIXES: true,
        TARGET_VERSION: 'Luau Handicapped',
        VM_ENCRYPTION: true,
        DISABLE_LINE_INFORMATION: true,
        USE_DEBUG_LIBRARY: true,
    };

    const {jobId} = await api.createNewJob(nodes.recommendedId, `${newScript}`, `${oldName}.lua`, options);

    const {success, error} = await api.getJobStatus(jobId);

    if (success) {

        const {fileName, data} = await api.downloadResult(jobId);

        const script = `script_key = "PASTESCRIPTKEYHERE";
--[[
        
                   This script has been licensed using LuaLock
               Unauthorized usage of this script is strictly forbidden.
      Any attempt of tampering, reverse engineering or modifying the scripts source
    or internal logic will result in a global ban, and get you blacklisted from future
               script executions that has been licensed with Lualock.
                    
                   LuaLock v1.1 for Roblox, made by PGamingHD#0666
                              https://lualock.org/

            
              ██╗░░░░░██╗░░░██╗░█████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗
              ██║░░░░░██║░░░██║██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝
              ██║░░░░░██║░░░██║███████║██║░░░░░██║░░██║██║░░╚═╝█████═╝░
              ██║░░░░░██║░░░██║██╔══██║██║░░░░░██║░░██║██║░░██╗██╔═██╗░
              ███████╗╚██████╔╝██║░░██║███████╗╚█████╔╝╚█████╔╝██║░╚██╗
              ╚══════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝
                            
                             Script ID: ${scriptA[0].script_id}

--]]


`;

        const actualScript = script + data.split("\n")[2].toString();

        const FILE = Buffer.from(actualScript, 'utf8').toString('hex');

        if (FILE) {
            await pool.query(`UPDATE script_storage SET script = x'${FILE}' WHERE script_id = ${scriptId}`);
            await pool.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft - 1 WHERE api_key = '${apiKey}'`);
        } else {
            return res.status(500).json({
                "message": "Something went wrong with the Database, please contact the Developer to fix this",
            });
        }

        return res.status(200).json({
            "message": "Successfully updated script"
        });
    } else {
        return res.status(500).json({
            "message": "Something went wrong with the Obfuscation, please contact the Developer to fix this",
        });
    }
});

module.exports = apiRouter;