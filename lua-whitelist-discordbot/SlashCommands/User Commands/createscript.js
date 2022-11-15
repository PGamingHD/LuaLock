const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    ApplicationCommandOptionType,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');
const ee = require('../../botconfig/embed.json');
const emoji = require('../../botconfig/embed.json');
const prettyMilliseconds = require('pretty-ms');
const config = require('../../botconfig/config.json');
const axios = require("axios");
const {
    generateSnowflake
} = require("../../handler/functions");
const Luraph = require("luraph").Luraph;
const api = new Luraph(process.env.LURAPH_API_TOKEN);

module.exports = {
    name: 'createscript',
    description: 'Create a script',
    commandCooldown: 30,
    options: [{
        name: 'scriptfile',
        description: 'The file you want to upload as your script.',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
    }],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, interaction, args, con) => {
        const scriptFile = interaction.options.getAttachment('scriptfile');
        const scriptName = scriptFile.name.split('.')[0];

        await interaction.reply({
            content: ':warning: Loading... (This might take a couple of seconds)',
            ephemeral: true
        });

        const [userExists, userRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = '${interaction.user.id}'`);

        if (userExists.length === 0) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Subscription :x:')
                    .setDescription(`**Woops, it looks like you have not yet linked an API key to your account.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        if (userExists[0].api_expirytime < Date.now() && !userExists[0].api_expired) {
            await con.query(`UPDATE user_storage SET api_expired = 1 WHERE discord_connecteduser = '${interaction.user.id}'`);

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: API Key Expired :x:')
                    .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        if (userExists[0].api_expired) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: API Key Expired :x:')
                    .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        if (scriptFile.length > 100) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Name :x:')
                    .setDescription(`**Woops, it looks like the name you entered is too long. (Max 100 characters)**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        const apiOwner = userExists[0].api_key;
        const scriptsLeft = userExists[0].api_scriptsleft;
        const obfuscationsLeft = userExists[0].api_obfuscationsleft;
    
        if (scriptsLeft === 0) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Reached Max Scripts :x:')
                    .setDescription(`**Woops, it looks like you have reached the maximum amount of scripts allowed for your subscription type.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        if (obfuscationsLeft === 0) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Out Of Obfuscations :x:')
                    .setDescription(`**Woops, it looks like you have ran out of obfuscations left this month.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                content: '',
                ephemeral: true
            });
        }

        const response = await axios.get(scriptFile.attachment);

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

        const rawScript = await api.createNewJob(nodes.recommendedId, `${response.data}`, `${scriptName}.lua`, options);
        const loaderScript = await api.createNewJob(nodes.recommendedId, `${finalLoader}`, `loader_${scriptName}.lua`, options);

        const rawStatus = await api.getJobStatus(rawScript.jobId);
        const loaderStatus = await api.getJobStatus(loaderScript.jobId);
        
        if (rawStatus.success && loaderStatus.success) {

            const raw = await api.downloadResult(rawScript.jobId);

            const loader = await api.downloadResult(loaderScript.jobId);

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
                await con.query(`INSERT INTO script_storage (script_id,script,script_apiowner,script_name,script_keys,loader_script) VALUES (${scriptID},x'${FILE}','${apiOwner}','${scriptName}','[]',x'${LOADER_FILE}')`);
                await con.query(`UPDATE user_storage SET api_scriptsleft = api_scriptsleft - 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
                await con.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft - 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.color)
                    .setTitle(`:white_check_mark: Generated Script :white_check_mark:`)
                    .setDescription(`**The script was successfully generated!**\n*Please contact support if you're having any issues with the script.*`)
                    .addFields([{
                        name: 'Script ID',
                        value: `\`${scriptID}\``
                    }, {
                        name: 'Script name',
                        value: `\`${scriptName}.lua\``
                    }])
                ],
                content: '',
                ephemeral: true
            });
        } else {
            if (rawStatus.error) throw rawStatus.error;
            if (loaderStatus.error) throw loaderStatus.error;
        }
    }
}