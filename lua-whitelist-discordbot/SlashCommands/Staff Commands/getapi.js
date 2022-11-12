    const {
        Client,
        EmbedBuilder,
        AttachmentBuilder
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json')
 
    module.exports = {
        name: 'getapi',
        description: 'Get some API information.',
        DeveloperCommand: true,
        commandCooldown: 15,
        /**
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const [apiKeys, apiRows] = await con.query(`SELECT * FROM user_storage`);

            if (apiKeys.length === 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: No API Keys Found :x:')
                        .setDescription(`**Woops, it seems like there were no whitelisted API Keys found.**`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            } else {
                const FILE = Buffer.from(JSON.stringify(apiKeys), 'utf-8');

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':white_check_mark: Here are the total API Keys :white_check_mark:')
                        .setDescription(`**Here you go, these are all the currently whitelisted API Keys.**`)
                        .setColor(ee.color)
                    ],
                    files: [
                        new AttachmentBuilder(FILE, {
                            name: `apiKEYS.json`,
                            description: 'All API Keys for LuaLock!',
                        })
                    ],
                    ephemeral: true
                });
            }
        }
    }