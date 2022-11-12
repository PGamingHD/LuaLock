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
const {
    generateKey
} = require("../../handler/functions.js");

module.exports = {
    name: 'redeem',
    description: 'Redeem one of your purchase license keys for a valid API key.',
    commandCooldown: 60,
    options: [{
        name: 'type',
        description: 'The key type you want to redeem',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{
            name: 'Pro',
            value: 'pro'
        }, {
            name: 'Premium',
            value: 'premium'
        }, {
            name: 'Vip',
            value: 'vip'
        }],
    }, {
        name: 'licensekey',
        description: 'The key you want to use to redeem the API key. (Make sure to have your DMs open)',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, interaction, args, con) => {
        const keyLength = interaction.options.getString('type');
        const licenseKey = interaction.options.getString('licensekey');
        const generatedAPIKey = generateKey();
        const expirationTime = Date.now() + 2629800000;

        if (keyLength === "pro") {
            const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM prokeys WHERE licensekey = '${licenseKey}'`);

            if (findLicenseKey.length !== 0) {

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(ee.color)
                        .setDescription(`**Successfully sent the API key into your DMs!**\n*Warning: If you have not enabled your DMs, please enable them and redeem again.*`)
                        .setTitle(':white_check_mark: Successfully redeemed API Key :white_check_mark:')
                    ],
                    ephemeral: true
                });

                try {
                    await interaction.user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Redeemed License Key :white_check_mark:`)
                            .setDescription(`**Successfully whitelisted key to our Database**\n*Please contact support if your provided key does not work.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'API Key',
                                value: `\`${generatedAPIKey}\``
                            }, {
                                name: 'API Type',
                                value: '\`Pro\`'
                            }])
                        ]
                    });
                } catch {
                    return;
                }

                await con.query(`INSERT INTO user_storage (api_key,api_expirytime,api_type,api_obfuscationsleft,api_scriptsleft,api_totalkeys) VALUES ('${generatedAPIKey}', '${expirationTime}', 2, 999999999, 10, 0)`);
                await con.query(`DELETE FROM prokeys WHERE licensekey = '${licenseKey}'`);
                return;
            } else {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:x: Invalid License Key :x:`)
                        .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${licenseKey}\``
                        }])
                    ],
                    ephemeral: true
                });
            }
        } else if (keyLength === "premium") {
            const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM premiumkeys WHERE licensekey = '${licenseKey}'`);

            if (findLicenseKey.length !== 0) {

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(ee.color)
                        .setDescription(`**Successfully sent the API key into your DMs!**\n*Warning: If you have not enabled your DMs, please enable them and redeem again.*`)
                        .setTitle(':white_check_mark: Successfully redeemed API Key :white_check_mark:')
                    ],
                    ephemeral: true
                });

                try {
                    await interaction.user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Redeemed License Key :white_check_mark:`)
                            .setDescription(`**Successfully whitelisted key to our Database**\n*Please contact support if your provided key does not work.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'API Key',
                                value: `\`${generatedAPIKey}\``
                            }, {
                                name: 'API Type',
                                value: '\`Premium\`'
                            }])
                        ]
                    });
                } catch {
                    return;
                }

                await con.query(`INSERT INTO user_storage (api_key,api_expirytime,api_type,api_obfuscationsleft,api_scriptsleft,api_totalkeys) VALUES ('${generatedAPIKey}', '${expirationTime}', 1, 500, 5, 0)`);
                await con.query(`DELETE FROM premiumkeys WHERE licensekey = '${licenseKey}'`);
            } else {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:x: Invalid License Key :x:`)
                        .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${licenseKey}\``
                        }])
                    ],
                    ephemeral: true
                });
            }
        } else if (keyLength === "vip") {
            const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM vipkeys WHERE licensekey = '${licenseKey}'`);

            if (findLicenseKey.length !== 0) {

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(ee.color)
                        .setDescription(`**Successfully sent the API key into your DMs!**\n*Warning: If you have not enabled your DMs, please enable them and redeem again.*`)
                        .setTitle(':white_check_mark: Successfully redeemed API Key :white_check_mark:')
                    ],
                    ephemeral: true
                });

                try {
                    await interaction.user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Redeemed License Key :white_check_mark:`)
                            .setDescription(`**Successfully whitelisted key to our Database**\n*Please contact support if your provided key does not work.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'API Key',
                                value: `\`${generatedAPIKey}\``
                            }, {
                                name: 'API Type',
                                value: '\`Vip\`'
                            }])
                        ]
                    });
                } catch {
                    return;
                }

                await con.query(`INSERT INTO user_storage (api_key,api_expirytime,api_type,api_obfuscationsleft,api_scriptsleft,api_totalkeys) VALUES ('${generatedAPIKey}', '${expirationTime}', 0, 100, 1, 0)`);
                await con.query(`DELETE FROM vipkeys WHERE licensekey = '${licenseKey}'`);
            } else {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:x: Invalid License Key :x:`)
                        .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${licenseKey}\``
                        }])
                    ],
                    ephemeral: true
                });
            }
        }
    }
}