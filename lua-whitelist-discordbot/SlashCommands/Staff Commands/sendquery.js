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
        name: 'sendquery',
        description: 'Execute something special to the Database!',
        DeveloperCommand: true,
        commandCooldown: 5,
        options: [{
            name: 'query',
            description: 'The SQL query you want to execute into the database!',
            type: ApplicationCommandOptionType.String,
            required: true,
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const queryString = interaction.options.getString('query');
            try {
                await con.query(`${queryString}`);

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(ee.color)
                        .setTitle(":white_check_mark: DB Query was executed successfully :white_check_mark:")
                        .addFields([{
                            name: 'DB Query',
                            value: `\`${queryString}\``
                        }])
                    ],
                    ephemeral: true
                });
            } catch (error) {
                console.log(error)

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(ee.errorColor)
                        .setTitle(":x: DB Query execution failed :x:")
                        .addFields([{
                            name: 'DB Query',
                            value: `\`${queryString}\``
                        }, {
                            name: 'Error Message',
                            value: `\`\`\`${error.message}\`\`\``
                        }])
                    ],
                    ephemeral: true
                });
            }
        }
    }