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
        name: 'login',
        description: 'Login and link an existing API key to your Discord Account.',
        commandCooldown: 60,
        options: [{
            name: 'apikey',
            description: 'The API key you want to link to this account.',
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
            const [userLinkedAlready, userLinkRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = '${interaction.user.id}'`)

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

            if (userExists[0].api_expirytime < Date.now() && !userExists[0].api_expired) {
                await con.query(`UPDATE user_storage SET api_expired = 1 WHERE api_key = '${apiKey}'`);

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: API Key Expired :x:')
                        .setDescription(`**Woops, it looks like that API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }

            if (userExists[0].api_expired) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: API Key Expired :x:')
                        .setDescription(`**Woops, it looks like that API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }

            if (userLinkedAlready.length !== 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Already Connected :x:')
                        .setDescription(`**Woops, it looks like your account has already been connected to another API Key!**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                        .addFields([{
                            name: 'API Key',
                            value: `\`${apiKey}\``
                        }])
                    ],
                    ephemeral: true
                });
            }

            if (userExists[0].discord_connecteduser !== "0") {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: API Key Already Linked :x:')
                        .setDescription(`**Woops, it looks like the provided API key has already been linked!**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                        .addFields([{
                            name: 'API Key',
                            value: `\`${apiKey}\``
                        }])
                    ],
                    ephemeral: true
                });
            }

            await con.query(`UPDATE user_storage SET discord_connecteduser = '${interaction.user.id}' WHERE api_key = '${apiKey}'`);

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.color)
                    .setTitle(`:white_check_mark: API Link Successful :white_check_mark:`)
                    .setDescription(`**You successfully linked account ID \`${interaction.user.id}\` to the provided key.**`)
                    .addFields([{
                        name: 'API Key',
                        value: `\`${apiKey}\``
                    }])
                ],
                ephemeral: true
            });
        }
    }