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
    name: 'scripts',
    description: 'Get all your owned scripts',
    commandCooldown: 15,
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, interaction, args, con) => {
        const [apiOwner, apiRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = ${interaction.user.id}`);

        if (apiOwner.length === 0) {
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

        const apiO = apiOwner[0];

        const [ownedScripts, ownedRows] = await con.query(`SELECT * FROM script_storage WHERE script_apiowner = '${apiO.api_key}'`);

        let desc = "";
        if (ownedScripts.length === 0) {
            desc += `**Could not find any owned scripts with your API Key.**`
        } else {
            for (let i = 0; i < ownedScripts.length; i++) {
                desc += `\`[${ownedScripts[i].script_id}]\` **${ownedScripts[i].script_name}.lua**\n\n`
            }
        }

        const embed = new EmbedBuilder()
        .setColor(ee.color)
        .setTitle(`:white_check_mark: Owned Scripts :white_check_mark:`)
        .setDescription(`${desc}`)
        .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
        })

        return await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}