//RENEW YOUR SUBSCRIPTION, IF api_expired = 1 THEN SET Date.now() + 1month, IF api_expired = 0 THEN api_expirytime = api_expirytime + 1month! (ALSO CHECK FOR EXPIRED API KEYS BEFORE)
//IF SUBSCRIPTION TYPE IS NOT SAME AS RENEWING WITH, THEN ASK TO LOGOUT WITH API KEY AND REDEEM NEW!
    const {
        Client,
        ApplicationCommandOptionType,
        EmbedBuilder
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json')
 
    module.exports = {
        name: 'renew',
        description: 'Renew your current subscription with a purchased license key.',
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

            if (keyLength === "pro") {
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

                if (userStorage[0].api_expirytime < Date.now() && !userStorage[0].api_expired) {
                    await con.query(`UPDATE user_storage SET api_expired = 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
        
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: API Key Expired :x:')
                            .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it by rerunning this command.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.errorColor)
                        ],
                        content: '',
                        ephemeral: true
                    });
                }

                const apiExpired = userStorage[0].api_expired;
                const apiType = userStorage[0].api_type;

                let apiName = "";
                if (apiType === 0) {
                    apiName = "Vip"
                } else if (apiType === 1) {
                    apiName = "Premium"
                } else if (apiType === 2) {
                    apiName = "Pro"
                }

                const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM prokeys WHERE licensekey = '${licenseKey}'`);

                if (findLicenseKey.length === 0) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid License Key :x:`)
                            .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'License Key',
                                value: `\`${licenseKey}\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiType !== 2) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid Subscription Type :x:`)
                            .setDescription(`**The license key and your current subscription does not have the same type, please logout and redeem new one to switch type!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Current Subscription Type',
                                value: `\`${apiName}\``
                            }, {
                                name: 'Key Subscription Type',
                                value: `\`Pro\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiExpired) {
                    const newTimeLeft = Date.now() + 2629800000;
                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft}' WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = 999999999 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM prokeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Renewed Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully renewed your Subscription type for another Month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Pro\``
                            }])
                        ],
                        ephemeral: true
                    });
                } else {
                    const newTimeLeft = parseInt(userStorage[0].api_expirytime) + 2629800000;

                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft}' WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = 999999999 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM prokeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Extended Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully extended your current subscription by one month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Pro\``
                            }])
                        ],
                        ephemeral: true
                    });
                }
            }

            if (keyLength === "premium") {
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

                if (userStorage[0].api_expirytime < Date.now() && !userStorage[0].api_expired) {
                    await con.query(`UPDATE user_storage SET api_expired = 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
        
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: API Key Expired :x:')
                            .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it by rerunning this command.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.errorColor)
                        ],
                        content: '',
                        ephemeral: true
                    });
                }

                const apiExpired = userStorage[0].api_expired;
                const apiType = userStorage[0].api_type;

                let apiName = "";
                if (apiType === 0) {
                    apiName = "Vip"
                } else if (apiType === 1) {
                    apiName = "Premium"
                } else if (apiType === 2) {
                    apiName = "Pro"
                }

                const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM premiumkeys WHERE licensekey = '${licenseKey}'`);

                if (findLicenseKey.length === 0) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid License Key :x:`)
                            .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'License Key',
                                value: `\`${licenseKey}\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiType !== 1) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid Subscription Type :x:`)
                            .setDescription(`**The license key and your current subscription does not have the same type, please logout and redeem new one to switch type!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Current Subscription Type',
                                value: `\`${apiName}\``
                            }, {
                                name: 'Key Subscription Type',
                                value: `\`Premium\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiExpired) {
                    const newTimeLeft = Date.now() + 2629800000;
                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft}' WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = 500 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM premiumkeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Renewed Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully renewed your Subscription type for another Month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Premium\``
                            }])
                        ],
                        ephemeral: true
                    });
                } else {
                    const newTimeLeft = parseInt(userStorage[0].api_expirytime) + 2629800000;

                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft}' WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft + 500 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM premiumkeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Extended Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully extended your current subscription by one month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Premium\``
                            }])
                        ],
                        ephemeral: true
                    });
                }
            }

            if (keyLength === "vip") {
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

                if (userStorage[0].api_expirytime < Date.now() && !userStorage[0].api_expired) {
                    await con.query(`UPDATE user_storage SET api_expired = 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
        
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: API Key Expired :x:')
                            .setDescription(`**Woops, it looks like your Linked API Key has expired, please renew it by rerunning this command.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.errorColor)
                        ],
                        content: '',
                        ephemeral: true
                    });
                }

                const apiExpired = userStorage[0].api_expired;
                const apiType = userStorage[0].api_type;

                let apiName = "";
                if (apiType === 0) {
                    apiName = "Vip"
                } else if (apiType === 1) {
                    apiName = "Premium"
                } else if (apiType === 2) {
                    apiName = "Pro"
                }

                const [findLicenseKey, licenseKeyRow] = await con.query(`SELECT * FROM vipkeys WHERE licensekey = '${licenseKey}'`);

                if (findLicenseKey.length === 0) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid License Key :x:`)
                            .setDescription(`**The key you provided does not seem to be valid!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'License Key',
                                value: `\`${licenseKey}\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiType !== 0) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:x: Invalid Subscription Type :x:`)
                            .setDescription(`**The license key and your current subscription does not have the same type, please logout and redeem new one to switch type!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Current Subscription Type',
                                value: `\`${apiName}\``
                            }, {
                                name: 'Key Subscription Type',
                                value: `\`Vip\``
                            }])
                        ],
                        ephemeral: true
                    });
                }

                if (apiExpired) {
                    const newTimeLeft = Date.now() + 2629800000;
                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft} WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = 100 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM vipkeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Renewed Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully renewed your Subscription type for another Month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Vip\``
                            }])
                        ],
                        ephemeral: true
                    });
                } else {
                    const newTimeLeft = parseInt(userStorage[0].api_expirytime) + 2629800000;

                    await con.query(`UPDATE user_storage SET api_expirytime = '${newTimeLeft} WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_expired = 0 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft + 100 WHERE discord_connecteduser = '${interaction.user.id}'`);
                    await con.query(`DELETE FROM vipkeys WHERE licensekey = '${licenseKey}'`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Extended Subscription :white_check_mark:`)
                            .setDescription(`**You have successfully extended your current subscription by one month!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Subscription Type',
                                value: `\`Vip\``
                            }])
                        ],
                        ephemeral: true
                    });
                }
            }
        }
    }