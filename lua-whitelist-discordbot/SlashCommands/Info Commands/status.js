    const {
        Client,
        CommandInteraction,
        MessageEmbed,
        MessageActionRow,
        MessageButton,
        EmbedBuilder
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json');
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json');
    const axios = require("axios");
 
    module.exports = {
        name: 'status',
        description: 'Get API Status & Bot Status!',
        commandCooldown: 15,
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const before = Date.now();
            await con.query('SELECT 1');
            const after = Date.now();
            const msCalculated = after - before;
            const apiResponse = await axios.get('https://api.lualock.com/v1/status');
            let apiLevel = "";

            const [dbLevel, dbRows] = await con.query(`SELECT * FROM user_storage WHERE discord_connecteduser = '${interaction.user.id}'`);

            if (dbLevel.length === 0) {
                apiLevel = "None"
            } else if (dbLevel[0].api_type === 0) {
                apiLevel = "Vip"
            } else if (dbLevel[0].api_type === 1) {
                apiLevel = "Premium"
            } else if (dbLevel[0].api_type === 2) {
                apiLevel = "Pro"
            }

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.color)
                    .setTitle(`:white_check_mark: Current Status :white_check_mark:`)
                    .addFields([{
                        name: 'Database Latency',
                        value: `\`\`\`yaml\n${msCalculated}ms\`\`\``
                    },{
                        name: 'API Response',
                        value: `\`\`\`yaml\n${apiResponse.data.Status}\`\`\``
                    }, {
                        name: 'Personal API Level',
                        value: `\`\`\`yaml\n${apiLevel}\`\`\``
                    }])
                ]
            })
        }
    }