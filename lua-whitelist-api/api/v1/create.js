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
    const scriptsLeft = apiKeyInfo[0].api_scriptsleft;
    const obfuscationsLeft = apiKeyInfo[0].api_obfuscationsleft;

    if (scriptsLeft === 0) {
        return res.status(500).json({
            "message": "Reached max amount of scripts allowed"
        });
    }

    if (obfuscationsLeft === 0) {
        return res.status(500).json({
            "message": "Reached max amount of obfuscations allowed this month"
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

if not script_key then
    return print("[LuaLock]: > No script Key was found, please add a script_key global variable to use auth with! < :[LuaLock]");
end

print("[LuaLock]: [1/5] > Authenticating to servers... < :[LuaLock]");

wait(0.5);

local Websocket = nil;

if syn then
    Websocket = syn.websocket.connect("ws://138.201.137.59:8888");
elseif KRNL_LOADED then
    Websocket = Krnl.WebSocket.connect("ws://138.201.137.59:8888");
elseif getexecutorname and type(getexecutorname) == "function" then
    Websocket = WebSocket.connect("ws://138.201.137.59:8888");
end

wait(0.5);

Websocket:Send("INITIATEAUTHENTICATION," ..scriptId.. ",NONE");

Websocket.OnMessage:Connect(function(Msg)
    if Msg == "INVALIDSCRIPTID" then
        return print("[LuaLock]: > That specific script could not be found, please contact the LuaLock Developer! < :[LuaLock]");
    elseif Msg == "VALIDSCRIPTID" then
        print("[LuaLock]: [2/5] > Confirming valid connection... < :[LuaLock]");
        
        wait(0.5);
        
        Websocket:Send("REQUESTINGAUTHENTICATIONKEY," ..script_key.. "," ..scriptId);
    elseif Msg == "INVALIDSCRIPTAUTHENTICATIONKEY" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Invalid Script Key, that Script Key is not valid for that Script! < :[LuaLock]");
    elseif Msg == "VALIDSCRIPTANDAUTHENTICATIONKEY" then
        print("[LuaLock]: [3/5] > Checking with licensing servers... < :[LuaLock]");
        
        wait(0.5);
        
        Websocket:Send("REQUESTINGWHITELISTCHECK," ..script_key.. "," ..scriptId);
    elseif Msg == "NOTSUPPORTEDEXECUTORTYPE" then
        return print("[LuaLock]: > It does not seem like that executor is currently supported by LuaLock! < :[LuaLock]");
    elseif Msg == "INITIATEFINALPHASE" then
        print("[LuaLock]: [4/5] > Successfully authenticated to servers! < :[LuaLock]");
        
        wait(0.5);
        Websocket:Send("INITIATEXECUTORWLCHECK," ..script_key.. "," ..scriptId);

    elseif Msg == "NOTCORRECTEXECUTORWLID" then
        return print("[LuaLock]: > The whitelisted executor ID does not match this executor ID! Contact Script Owner. < :[LuaLock]");
    elseif Msg == "FINALEXECUTORCHECKWASCORRECT" then
        print("[LuaLock]: [5/5] > Fully Authenticated, executing script! < :[LuaLock]");

        wait(0.5);

        Websocket:Send("REQUESTINGAUTHENTICATEDLOADERSCRIPT," ..scriptId.. ",NONE");
    elseif Msg == "SCRIPTWASREMOVEDBEFORE" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Heartbeat recived, the executed script was removed! < :[LuaLock]");
    elseif Msg == "SCRIPTKEYWASREMOVEDBEFORE" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Heartbeat recived, the script key was blacklisted! < :[LuaLock]");
    elseif Msg == "RECIEVEDHEARTBEATSUCCESS" then
        print("[LuaLock]: > Recieved Heartbeat... < :[LuaLock]");
    else
        loadstring(Msg)(); -- MAKE A while wait(300) do LOOP, FOR EVERY 5 MIN RECHECK FOR POSSIBLE AUTH CHANGES!

        print("[LuaLock]: > Script was successfully executed! < :[LuaLock]");

        while wait(300) do
            Websocket:Send("REQUESTINGHEARTBEATRN," ..script_key.. "," ..scriptId);
        end
    end
end);

Websocket.OnClose:Connect(function()
    return game.Players.LocalPlayer:Kick("[LuaLock]: > Lost Heartbeat to Websocket, was it restarted? < :[LuaLock]");
end);`

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

                   LuaLock v1.1 for Roblox, made by PGamingHD#0666
                              https://lualock.com/

            
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
            await pool.query(`UPDATE user_storage SET api_scriptsleft = api_scriptsleft - 1 WHERE api_key = '${apiKeyInfo[0].api_key}'`);
            await pool.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft - 1 WHERE api_key = '${apiKeyInfo[0].api_key}'`);
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