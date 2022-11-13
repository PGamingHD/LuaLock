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
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json')

    module.exports = {
        name: 'updatescript',
        description: 'Update one of your owned scripts',
        commandCooldown: 30,
        options: [{
            name: 'scriptid',
            description: 'The script ID you want to upload a new script to.',
            type: ApplicationCommandOptionType.String,
            required: true,
        }, {
            name: 'scriptfile',
            description: 'The file you want to upload as your script.',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const scriptId = interaction.options.getString('scriptid');
            const scriptFile = interaction.options.getAttachment('scriptfile');

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

            const [script, scriptRows] = await con.query(`SELECT * FROM script_storage WHERE script_id = '${scriptId}' AND script_apiowner = '${userExists[0].api_key}'`);

            if (script.length === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Invalid Script ID :x:')
                        .setDescription(`**Woops, it looks like that script was not found. Is that a valid ID and are you the owner?**\n*Please contact support if you think this is wrong.*`)
                        .setColor(ee.errorColor)
                    ],
                    content: '',
                    ephemeral: true
                });
            } else {
                if (userExists[0].api_obfuscationsleft === 0) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(':x: Out Of Obfuscations :x:')
                            .setDescription(`**Woops, it looks like you have ran out of obfuscations left this month.**\n*Please contact support if you think this is wrong.*`)
                            .setColor(ee.errorColor)
                        ],
                        content: '',
                        ephemeral: true
                    });
                }

                const oldName = script[0].script_name;

                const nodes = await api.getNodes();
            
                const options = {
                    INTENSE_VM_STRUCTURE: true,
                    ENABLE_GC_FIXES: true,
                    TARGET_VERSION: 'Luau Handicapped',
                    VM_ENCRYPTION: true,
                    DISABLE_LINE_INFORMATION: true,
                    USE_DEBUG_LIBRARY: true,
                };
            
                const {jobId} = await api.createNewJob(nodes.recommendedId, `${newScript}`, `${oldName}.lua`, options);
            
                const {success, error} = await api.getJobStatus(jobId);

                if (success) {

                    const {fileName, data} = await api.downloadResult(jobId);

                    const script = `script_key = "PASTESCRIPTKEYHERE";
--[[
                            
                    This script has been licensed using LuaLock
                Unauthorized usage of this script is strictly forbidden.
        Any attempt of tampering, reverse engineering or modifying the scripts source
    or internal logic will result in a global ban, and get you blacklisted from future
                script executions that has been licensed with Lualock.
                                        
                    LuaLock v1.1 for Roblox, made by PGamingHD#0666
                                https://lualock.org/
                    
                                
                ██╗░░░░░██╗░░░██╗░█████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗
                ██║░░░░░██║░░░██║██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝
                ██║░░░░░██║░░░██║███████║██║░░░░░██║░░██║██║░░╚═╝█████═╝░
                ██║░░░░░██║░░░██║██╔══██║██║░░░░░██║░░██║██║░░██╗██╔═██╗░
                ███████╗╚██████╔╝██║░░██║███████╗╚█████╔╝╚█████╔╝██║░╚██╗
                ╚══════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝
                                                
                             Script ID: ${script[0].script_id}
                    
--]]
                    
                    
`;

                    const actualScript = script + data.split("\n")[2].toString();

                    const FILE = Buffer.from(actualScript, 'utf8').toString('hex');

                    if (FILE) {
                        try {
                            await con.query(`UPDATE script_storage SET script = x'${FILE}' WHERE script_id = '${scriptId}'`);
                            await con.query(`UPDATE user_storage SET api_obfuscationsleft = api_obfuscationsleft - 1 WHERE discord_connecteduser = '${interaction.user.id}'`);
        
                            return await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`:white_check_mark: Successfully Updated Script :white_check_mark:`)
                                    .setDescription(`**Successfully Updated the script with the choosen ID, you can get the new script with the same ID!**`)
                                    .setColor(ee.color)
                                    .addFields([{
                                        name: 'Script ID',
                                        value: `\`${scriptId}\``
                                    }])
                                ],
                                content: '',
                                ephemeral: true
                            });
                        } catch (error) {
                            return await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`:white_check_mark: Database Insertion Failed :white_check_mark:`)
                                    .setDescription(`**It looks like something broke when trying insert the script into the Database, please contact the Developer.**`)
                                    .setColor(ee.errorColor)
                                    .addFields([{
                                        name: 'Script ID',
                                        value: `\`${scriptId}\``
                                    }])
                                ],
                                content: '',
                                ephemeral: true
                            });
                        }
                    } else {
                        return await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`:white_check_mark: File Obfuscation Failed :white_check_mark:`)
                                .setDescription(`**It looks like something broke when trying to Obfuscate the script, please contact the Developer.**`)
                                .setColor(ee.errorColor)
                                .addFields([{
                                    name: 'Script ID',
                                    value: `\`${scriptId}\``
                                }])
                            ],
                            content: '',
                            ephemeral: true
                        });
                    }
                } else {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`:white_check_mark: File Obfuscation Failed :white_check_mark:`)
                            .setDescription(`**It looks like something broke when trying to Obfuscate the script, please contact the Developer.**`)
                            .setColor(ee.errorColor)
                            .addFields([{
                                name: 'Script ID',
                                value: `\`${scriptId}\``
                            }])
                        ],
                        content: '',
                        ephemeral: true
                    });
                }
            }
        }
    }