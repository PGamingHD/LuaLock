    const {
        Client,
        CommandInteraction,
        MessageEmbed,
        MessageActionRow,
        MessageButton,
        EmbedBuilder
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json')
 
    module.exports = {
        name: 'stats',
        description: 'View your total LuaLock Stats',
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const [userExists, userRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = '${interaction.user.id}'`);

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

            if (userExists[0].api_expirytime < Date.now() && !userExists[0].api_expired) {
                await con.query(`UPDATE user_storage SET api_expired = 1 WHERE discord_connecteduser = '${interaction.user.id}'`);

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: API Key Expired :x:')
                        .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            }

            if (userExists[0].api_expired) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: API Key Expired :x:')
                        .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it asap.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            }

            const [ownedScripts, scriptsOwned] = await con.query(`SELECT COUNT(*) FROM script_storage WHERE script_apiowner = '${userExists[0].api_key}'`);

            let aType = ""
            if (userExists[0].api_type === 0) {
                aType = "Vip"
            } else if (userExists[0].api_type === 1) {
                aType = "Premium"
            } else {
                aType = "Pro"
            }

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.color)
                    .setTitle(`:white_check_mark: LuaLock Personal Stats`)
                    .addFields([{
                        name: 'API Key',
                        value: `\`${userExists[0].api_key}\``,
                        inline: true,
                    }, {
                        name: 'API Expirytime [UNIX]',
                        value: `\`${userExists[0].api_expirytime}\``,
                        inline: true,
                    }, {
                        name: 'Api Type',
                        value: `\`${aType}\``,
                        inline: true,
                    }, {
                        name: 'API Obfuscations Remaining',
                        value: `\`${userExists[0].api_obfuscationsleft}x\``,
                        inline: true,
                    }, {
                        name: 'Api Scripts Remaining',
                        value: `\`${userExists[0].api_scriptsleft}x\``,
                        inline: true,
                    }, {
                        name: 'API Whitelisted IP',
                        value: `\`${userExists[0].api_whitelistedip}\``,
                        inline: true,
                    }, {
                        name: 'Scripts Owned',
                        value: `\`${ownedScripts[0]['COUNT(*)'] === 0 ? "You do not currently own any scripts." : `${ownedScripts[0]['COUNT(*)']}x`}\``,
                        inline: true,
                    }])
                ],
                ephemeral: true
            });
        }
    }