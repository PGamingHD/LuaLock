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

        const [scriptsCount, scriptsRows] = await con.query(`SELECT COUNT(*) FROM script_storage WHERE script_apiowner = '${apiOwner}'`);

        let maxScripts = 0;
        if (userExists[0].api_type === 0) {
            maxScripts = 1;
        } else if (userExists[0].api_type === 1) {
            maxScripts = 5;
        } else if (userExists[0].api_type === 2) {
            maxScripts = 10;
        }
    
        if (scriptsCount[0]['COUNT(*)'] >= maxScripts) {
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
    return game.Players.LocalPlayer:Kick("Invalid Script Key, contact Support for further help!");
end

print("[LuaLock]: [4/4] > Successfully authenticated to servers! < [LuaLock]");
wait(1);

return loadstring(apires)();`

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
                await con.query(`INSERT INTO script_storage (script_id,script,script_apiowner,script_name,script_keys,loader_script) VALUES (${scriptID},x'${FILE}','${apiOwner}','${scriptName}','[]',x'${LOADER_FILE}')`);
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