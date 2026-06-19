    const {
        Client,
        ApplicationCommandOptionType,
        EmbedBuilder
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json');
    const config = require('../../botconfig/config.json');
    const axios = require("axios");

    module.exports = {
        name: 'apiwhitelist',
        description: 'Whitelist a specific IP to our API using an API Key.',
        commandCooldown: 60,
        options: [{
            name: 'ip',
            description: 'The IP you want to whitelist to our API',
            type: ApplicationCommandOptionType.String,
            required: true,
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const allowIp = interaction.options.getString('ip');

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

            if (!ValidateIPaddress(allowIp)) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Invalid IP Address :x:')
                        .setDescription(`**Woops, it looks like the IP you inserted is not a valid IP address.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }

            if (allowIp.length > 45) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Invalid IP Length :x:')
                        .setDescription(`**Woops, it looks like you have have entered a invalid IP, please fix this.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }

            if (allowIp === userExists[0].api_whitelistedip) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: IP Already Whitelisted :x:')
                        .setDescription(`**Woops, it looks like that IP has already been whitelisted for your API Key.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }

            const data = [{
                ip: `${allowIp}`,
                comment: `${interaction.user.tag} [${interaction.user.id}]`
            }];

            const getList = await axios.get("https://api.cloudflare.com/client/v4/accounts/f746d867dfe1e554d8a2945486da38f4/rules/lists/45cc043a30df4d12b2bdad285a164c41/items", {
                headers: {
                    'content-type': 'application/json',
                    'X-Auth-Email': 'pontus.2003@hotmail.com',
                    'Authorization': 'Bearer 0xFlHS9zMn6B1oDPiOnD95lfQbVeGGpf6uFmtisM'
                }
            });

            if (getList.data.success) {

                const list = getList.data.result;
                let ipId = "";
                for (let i = 0; i < list.length; i++) {
                    if (list[i].ip === userExists[0].api_whitelistedip) {
                        ipId = list[i].id;
                    }
                }

                if (ipId.length !== 0) {
                    await axios.delete("https://api.cloudflare.com/client/v4/accounts/f746d867dfe1e554d8a2945486da38f4/rules/lists/45cc043a30df4d12b2bdad285a164c41/items", {
                        headers: {
                            'content-type': 'application/json',
                            'X-Auth-Email': 'pontus.2003@hotmail.com',
                            'Authorization': 'Bearer 0xFlHS9zMn6B1oDPiOnD95lfQbVeGGpf6uFmtisM'
                        },
                        data: {
                            "items": [{
                                "id": ipId
                            }]
                        }
                    });
                }

                const postIp = await axios.post("REMOVED", data, {
                    headers: {
                        'content-type': 'application/json',
                        'X-Auth-Email': 'pontus.2003@hotmail.com',
                        'Authorization': 'Bearer'
                    }
                });

                if (postIp.data.success) {
                    await con.query(`UPDATE user_storage SET api_whitelistedip = '${allowIp}' WHERE discord_connecteduser = '${interaction.user.id}'`);

                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':white_check_mark: Successfully whitelisted IP to API :white_check_mark:')
                            .setDescription(`**Successfully whitelisted IP address to our API servers, you should soon be able to use the API.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                        ],
                        content: '',
                        ephemeral: true
                    });
                } else {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: Something went wrong :x:')
                            .setDescription(`**Something went wrong while whitelisting your IP, please contact the developer to fix this.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.errorColor)
                        ],
                        content: '',
                        ephemeral: true
                    });
                }
            } else {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Something went wrong :x:')
                        .setDescription(`**Something went wrong while whitelisting your IP, please contact the developer to fix this.**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            }
        }
    }


    function ValidateIPaddress(ipaddress) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
            return true;
        }
        return false;
    }
