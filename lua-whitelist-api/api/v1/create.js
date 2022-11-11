const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();
const getPool = require("../../database");
const bodyParser = require('body-parser');
const {
    generateSnowflake
} = require("../../handler/functions");

const Luraph = require("luraph").Luraph;
const api = new Luraph(process.env.LURAPH_API_TOKEN);

apiRouter.use(bodyParser.urlencoded({ extended: true }));

const createLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 1,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/script', createLimiter);
apiRouter.post("/script", async (req, res, next) => {

    const apiKey = req.get('Authorization');
    const scriptName = req.body.script_name;
    const platform = req.body.platform;
    const script = req.body.script;
    const pool = await getPool().getConnection();

    const [apiKeyInfo, apiRows] = await pool.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);

    if (apiKeyInfo.length === 0) {
        return res.status(401).json({
            "message": "Invalid API Key"
        });
    }

    if (!script || !platform || !scriptName) {
        return res.status(400).json({
            "message": "Missing Parameters"
        });
    }

    if (platform.toLowerCase() !== "roblox") {
        return res.status(500).json({
            "message": "Invalid platform name"
        })
    }

    if (scriptName.length > 100) {
        return res.status(500).json({
            "message": "Script name too long, max length is 100 characters"
        });
    }

    const apiOwner = apiKeyInfo[0].api_key;

    const [scriptsCount, scriptsRows] = await pool.query(`SELECT COUNT(*) FROM script_storage WHERE script_apiowner = '${apiKeyInfo[0].api_key}'`);

    let maxScripts = 0;
    if (apiKeyInfo[0].api_type === 0) {
        maxScripts = 1;
    } else if (apiKeyInfo[0].api_type === 1) {
        maxScripts = 5;
    } else if (apiKeyInfo[0].api_type === 2) {
        maxScripts = 10;
    }

    if (scriptsCount[0]['COUNT(*)'] >= maxScripts) {
        return res.status(500).json({
            "message": "Reached max amount of scripts allowed"
        });
    }

    const nodes = await api.getNodes();

    const options = {
        INTENSE_VM_STRUCTURE: true,
        ENABLE_GC_FIXES: true,
        TARGET_VERSION: 'Luau Handicapped',
        VM_ENCRYPTION: true,
        DISABLE_LINE_INFORMATION: true,
        USE_DEBUG_LIBRARY: true,
    };

    const loaderStart = 
`local scriptId = "INSERTSCRIPTID";

if not syn then
    return print("[LuaLock]: > This project is only constructed to work on S^X at the moment, please wait for updates! < [LuaLock]")
end

if not script_key then
    return print("[LuaLock]: > No script Key was found, please add a script_key global variable to use auth with! < [LuaLock]");
end
    
print("[LuaLock]: [1/4] > Authenticating to servers... < [LuaLock]");
    
wait(1)
    
local Response = syn.request({
    Url = "https://api.lualock.com/v1/auth/loader/" ..scriptId.. "/" ..script_key,
    Method = "GET",
    headers = {
        ["Content-Type"] = "application/json"
    },
});
    
local apires = Response.Body;
    
if apires == "SCRIPTINVALID" then
    return print("[LuaLock]: > Something went wrong while executing the script, please contact the Developer ASAP! < [LuaLock]");
end

if apires == "NOTAUTHORIZED" then
   return print("[LuaLock]: > No auth header was sent, is this executor supported by LuaLock? < [LuaLock]");
end
    
if apires == "Invalid Endpoint" then
    return print("[LuaLock]: > Failed to load, Invalid API Endpoint? < [LuaLock]")
end
    
print("[LuaLock]: [2/4] > Checking with api servers... < [LuaLock]");
    
wait(1);
if apires == "Too many requests, please try again later." then
    return print("[LuaLock]: > You are being ratelimited, try executing again in 15 seconds! < [LuaLock]");
end
    
print("[LuaLock]: [3/4] > Connecting to licensing servers < [LuaLock]");
    
wait(0.5);
if apires == "UNAUTHENTICATED" then
    return game.Players.LocalPlayer:Kick("[LuaLock]: > Invalid Script Key, contact Support for further help! < [LuaLock]");
end

if apires == "" then
   return print("[LuaLock]: > Script was not returned, contact the LuaLock Developer! < [LuaLock]");
end
    
print("[LuaLock]: [4/4] > Successfully authenticated to servers! < [LuaLock]");
wait(1);
    
return loadstring(apires)();`

    const scriptID = generateSnowflake();

    const finalLoader = loaderStart.replace("INSERTSCRIPTID", `${scriptID}`);

    const rawScript = await api.createNewJob(nodes.recommendedId, `${script}`, `${scriptName}.lua`, options);
    const loaderScript = await api.createNewJob(nodes.recommendedId, `${finalLoader}`, `loader_${scriptName}.lua`, options);

    const rawStatus = await api.getJobStatus(rawScript.jobId);
    const loaderStatus = await api.getJobStatus(loaderScript.jobId);

    if (rawStatus.success && loaderStatus.success) {

        const raw = await api.downloadResult(rawScript.jobId);

        const loader = await api.downloadResult(loaderScript.jobId);

        //const {fileName, data} = await api.downloadResult(jobId);

        const script = `script_key = "PASTESCRIPTKEYHERE";
--[[
        
                   This script has been licensed using LuaLock
               Unauthorized usage of this script is strictly forbidden.
      Any attempt of tampering, reverse engineering or modifying the scripts source
    or internal logic will result in a global ban, and get you blacklisted from future
               script executions that has been licensed with Lualock.
                    
                   LuaLock v1 for Roblox, made by PGamingHD#0666
                              https://lualock.org/

            
              ██╗░░░░░██╗░░░██╗░█████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗
              ██║░░░░░██║░░░██║██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝
              ██║░░░░░██║░░░██║███████║██║░░░░░██║░░██║██║░░╚═╝█████═╝░
              ██║░░░░░██║░░░██║██╔══██║██║░░░░░██║░░██║██║░░██╗██╔═██╗░
              ███████╗╚██████╔╝██║░░██║███████╗╚█████╔╝╚█████╔╝██║░╚██╗
              ╚══════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝
                            
                             Script ID: ${scriptID}

--]]


`;
        const loader_actualScript = script + loader.data.split("\n")[2].toString();
        const actualScript = raw.data.split("\n")[2].toString();

        const FILE = Buffer.from(actualScript, 'utf8').toString('hex');

        const LOADER_FILE = Buffer.from(loader_actualScript, 'utf8').toString('hex');

        if (FILE && LOADER_FILE) {
            await pool.query(`INSERT INTO script_storage (script_id,script,script_apiowner,script_name,script_keys,loader_script) VALUES (${scriptID},x'${FILE}','${apiOwner}','${scriptName}','[]',x'${LOADER_FILE}')`);
        } else {
            return res.status(500).json({
                "message": "Something went wrong with the Database, please contact the Developer to fix this",
            });
        }

        return res.status(200).json({
            "message": "Successfully created a new script"
        });
    } else {
        return res.status(500).json({
            "message": "Something went wrong with the Obfuscation, please contact the Developer to fix this",
        });
    }
});

module.exports = apiRouter;