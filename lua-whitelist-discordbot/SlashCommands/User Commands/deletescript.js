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
    name: 'deletescript',
    description: 'Delete an existing script',
    options: [{
        name: 'scriptid',
        description: 'The file you want to upload as your script.',
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
        } else {
            try{
                await con.query(`DELETE FROM script_storage WHERE script_id = ${scriptId} AND script_apiowner = '${userStorage[0].api_key}'`);

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:white_check_mark: Successfully Deleted Script :white_check_mark:`)
                        .setDescription(`**Successfully deleted the script with the choosen ID, the script can not be recovered now!**`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Script ID',
                            value: `\`${scriptId}\``
                        }])
                    ],
                    ephemeral: true
                });
            } catch (error) {
                console.log("Did the DB delete fail? ", error)

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:x: Failed To Delete :x:`)
                        .setDescription(`**Database query failed to delete the script, please contact the LuaLock Developer ASAP!**`)
                        .setColor(ee.color)
                    ],
                    ephemeral: true
                });
            }
        }
    }
}