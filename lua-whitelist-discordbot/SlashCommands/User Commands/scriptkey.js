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
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json');
    const { generateKey } = require('../../handler/functions');
 
    module.exports = {
        name: 'scriptkey',
        description: 'Whitelist/Blacklist a Script Key to use your scripts',
        commandCooldown: 15,
        options: [{
            name: 'whitelist',
            description: 'Whitelist a Script Key for one of your scripts',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'scriptid',
                description: 'The ID of the script you want to generate a key for.',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }, {
            name: 'blacklist',
            description: 'Blacklist a Script Key from one of your scripts',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'scriptid',
                description: 'The ID of the script you want to generate a key for.',
                type: ApplicationCommandOptionType.String,
                required: true
            }, {
                name: 'scriptkey',
                description: 'The Script Key you want to blacklist from executing more scripts',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }, {
            name: 'getall',
            description: 'Get all your Script Keys of a specific scripts, will return them in a file',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'scriptid',
                description: 'The ID of the script you want to generate a key for.',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {

            if (interaction.options.getSubcommand() === "whitelist") {
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
                    try {
                        const genedKey = generateKey()
                        await con.query(`UPDATE script_storage SET script_keys = JSON_ARRAY_APPEND(script_keys,'$',CAST('{"scriptkey": "${genedKey}"}' AS JSON)) WHERE script_id = '${scriptId}' AND script_apiowner = '${userStorage[0].api_key}'`);
                        
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`:white_check_mark: Successfully Generated Script Key :white_check_mark:`)
                                .setDescription(`**Successfully whitelisted Script Key, please give this to someone that should be able to execute the script!**\n*Please contact support if you think this is wrong.*`)
                                .setColor(ee.color)
                                .addFields([{
                                    name: 'Script ID',
                                    value: `\`${scriptId}\``
                                }, {
                                    name: 'Script Key',
                                    value: `\`${genedKey}\``
                                }])
                            ],
                            ephemeral: true
                        });
                    } catch (error) {
                        console.log("Did the DB JSON insert fail? ", error)
    
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`:x: Failed To Insert Key :x:`)
                                .setDescription(`**Database query failed to insert the key, please contact the LuaLock Developer ASAP!**`)
                                .setColor(ee.color)
                            ],
                            ephemeral: true
                        });
                    }
                }
            }

            if (interaction.options.getSubcommand() === "blacklist") {
                const scriptId = interaction.options.getString('scriptid');
                const scriptKey = interaction.options.getString('scriptkey');

                const [userStorage, userRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = ${interaction.user.id}`);
                const [keyCheck, checkRows] = await con.query(`SELECT * FROM script_storage WHERE JSON_SEARCH(script_keys, "one", "${scriptKey}") AND script_id = '${scriptId}'`);
    
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

                if (keyCheck.length === 0) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: Invalid Script Key :x:')
                            .setDescription(`**Woops, it looks like that Script Key is not linked to that Script ID!**\n*Please contact support if you think this is wrong.*`)
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
                    const [search, searching] = await con.query(`SELECT JSON_SEARCH('${JSON.stringify(script[0].script_keys)}', 'one', '${scriptKey}')`);

                    const keyPlace = Object.values(search[0])[0].split('.')[0];

                    await con.query(`UPDATE script_storage SET script_keys = JSON_REMOVE(script_keys, '${keyPlace}')`);

                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: Successfully Blacklisted Key :white_check_mark:`)
                            .setDescription(`**Successfully blacklisted Script Key, the key will no longer be useable by the key owner!**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.color)
                            .addFields([{
                                name: 'Script ID',
                                value: `\`${scriptId}\``
                            }, {
                                name: 'Script Key',
                                value: `\`${scriptKey}\``
                            }])
                        ],
                        ephemeral: true
                    });
                }
                //const [search, searching] = await con.query(`SELECT * FROM script_storage`);

                //await con.query(`SELECT script_storage.script_keys AS before_remove, JSON_REMOVE(script_keys, JSON_UNQUOTE(JSON_EXTRACT(JSON_SEARCH('${JSON.stringify(script[0].script_keys)}', 'all', '{"scriptkey": "lualock-ad2e4165f8d91ccde706f571e3e443f6"}'))))`
                //const [test, test2] = await con.query(`UPDATE script_storage SET script_keys = JSON_REMOVE(script_keys, JSON_UNQUOTE(JSON_SEARCH(script_keys, 'one', 'lualock-516b283e909f3bd79a0034655a64d8a5'))) WHERE JSON_SEARCH(script_keys, 'one', 'lualock-516b283e909f3bd79a0034655a64d8a5') IS NOT NULL;`);
                //console.log(test)
                //await con.query(`UPDATE script_storage AS s SET script_keys = JSON_REMOVE(s.script_keys, JSON_UNQUOTE(JSON_search(s.script_keys, 'one', '${scriptKey}')))`)
            }

            if (interaction.options.getSubcommand() === "getall") {
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
                    let keys = script[0].script_keys;

                    if (keys.length === 0) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(':x: No Whitelisted Keys Found :x:')
                                .setDescription(`**Woops, it seems like you have yet to whitelist a key, please generate one first!**\n*Please contact support if you think this is wrong.*`)
                                .setColor(ee.errorColor)
                            ],
                            ephemeral: true
                        });
                    } else {
                        const FILE = Buffer.from(JSON.stringify(keys), 'utf-8');

                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(':white_check_mark: Here are your keys :white_check_mark:')
                                .setDescription(`**Here you go, these are all your whitelisted keys!**\n*Please contact support if you think this is wrong.*`)
                                .setColor(ee.color)
                            ],
                            files: [
                                new AttachmentBuilder(FILE, {
                                    name: `scriptKEYS.json`,
                                    description: 'All Script Keys for script!',
                                })
                            ],
                            ephemeral: true
                        });
                    }
                }
            }
        }
    }