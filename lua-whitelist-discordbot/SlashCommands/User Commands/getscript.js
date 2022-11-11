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

module.exports = {
    name: 'getscript',
    description: 'Get a script',
    options: [{
        name: 'scriptid',
        description: 'The ID of the script you want to fetch the loader for.',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, interaction, args, con) => {
        const scriptId = interaction.options.getString('scriptid');

        const [userStorage, userRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = ${interaction.user.id}`);

        if (userStorage.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Subscription :x:')
                    .setDescription(`**Woops, it looks like you have not yet linked an API key to your account.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                ephemeral: true
            });
        }

        const [script, scriptRows] = await con.query(`SELECT * FROM script_storage WHERE script_id = '${scriptId}' AND script_apiowner = '${userStorage[0].api_key}'`);

        if (script.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Script ID :x:')
                    .setDescription(`**Woops, it looks like that script was not found. Is that a valid ID and are you the owner?**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                ephemeral: true
            });
        }

        const file = script[0].loader_script;

        return await interaction.reply({
            content: ':white_check_mark: Here is your script, please give this to your buyers. :white_check_mark:',
            files: [
                new AttachmentBuilder(file, {
                    name: `${script[0].script_name}.lua`,
                    description: 'Script protected by LuaLock!',
                })
            ],
            ephemeral: true
        });

        if (userExists.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Subscription :x:')
                    .setDescription(`**Woops, it looks like you have not yet linked an API key to your account.**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                ephemeral: true
            });
        }

        if (scriptFile.length > 100) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid Name :x:')
                    .setDescription(`**Woops, it looks like the name you entered is too long. (Max 100 characters)**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                ],
                ephemeral: true
            });
        }

        const apiOwner = userExists[0].api_key;

        const response = await axios.get(scriptFile.attachment);

        const FILE = Buffer.from(response.data, 'utf8').toString('hex');

        const scriptID = generateSnowflake();

        if (FILE) {
            await con.query(`INSERT INTO script_storage (script_id,script,script_apiowner,script_name) VALUES (${scriptID},x'${FILE}','${apiOwner}','${scriptName}')`);
        }

        return await interaction.reply({
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
                    value: `\`${scriptName}\``
                }])
            ],
            ephemeral: true
        });
    }
}