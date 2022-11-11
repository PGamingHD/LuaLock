const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    ApplicationCommandOptionType,
    EmbedBuilder
} = require('discord.js');
const ee = require('../../botconfig/embed.json');
const emoji = require('../../botconfig/embed.json');
const prettyMilliseconds = require('pretty-ms');
const config = require('../../botconfig/config.json');

module.exports = {
    name: 'logout',
    description: 'Unlink an existing API Key from a linked account.',
    options: [{
        name: 'apikey',
        description: 'The API key you want to unlink from this account.',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, interaction, args, con) => {
        const apiKey = interaction.options.getString('apikey');

        const [userExists, userRows] = await con.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);
        const [isLinked, linkedRows] = await con.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}' AND discord_connecteduser = '${interaction.user.id}'`);

        if (userExists.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Invalid API Key :x:')
                    .setDescription(`**Woops, it looks like the provided API key is not valid!**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                    .addFields([{
                        name: 'API Key',
                        value: `\`${apiKey}\``
                    }])
                ],
                ephemeral: true
            });
        }

        if (userExists[0].discord_connecteduser === "0") {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Not Linked :x:')
                    .setDescription(`**Woops, it looks like that API Key has not yet been linked to an account!**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                    .addFields([{
                        name: 'API Key',
                        value: `\`${apiKey}\``
                    }])
                ],
                ephemeral: true
            });
        }

        if (isLinked.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':x: Linked To Another Account :x:')
                    .setDescription(`**Woops, it looks like this is not the account linked to that API Key!**\n*Please contact support if you think this is wrong.*`)
                    .setColor(ee.errorColor)
                    .addFields([{
                        name: 'API Key',
                        value: `\`${apiKey}\``
                    }])
                ],
                ephemeral: true
            });
        }

        await con.query(`UPDATE user_storage SET discord_connecteduser = '0' WHERE api_key = '${apiKey}'`);

        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(ee.color)
                .setTitle(`:white_check_mark: API Unlink Successful :white_check_mark:`)
                .setDescription(`**You successfully unlinked account ID \`${interaction.user.id}\` to the provided key.**`)
                .addFields([{
                    name: 'API Key',
                    value: `\`${apiKey}\``
                }])
            ],
            ephemeral: true
        });
    }
}