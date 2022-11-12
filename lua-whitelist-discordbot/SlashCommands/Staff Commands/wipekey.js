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
        name: 'wipekey',
        description: 'Wipe a key from the database, has rules been broken with this key?',
        DeveloperCommand: true,
        commandCooldown: 15,
        options: [{
            name: 'apikey',
            description: 'The API Key you want to remove from the Database',
            type: ApplicationCommandOptionType.String,
            required: true
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const apiKey = interaction.options.getString('apikey');

            const [userExists, userRows] = await con.query(`SELECT * FROM user_storage WHERE api_key = '${apiKey}'`);

            if (userExists.length === 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Invalid API Key :x:')
                        .setDescription(`**Woops, it looks like that API Key is not linked to a valid Subscription.**`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            }

            try {
                await con.query(`DELETE FROM user_storage WHERE api_key = '${apiKey}'`);
            } catch (error) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Failed To Delete Storage API Key :x:')
                        .setDescription(`**Woops, I failed to execute the delete user_storage query!**`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            }

            const [hasScripts, scriptRows] = await con.query(`SELECT * FROM script_storage WHERE script_apiowner = '${apiKey}'`);

            if (hasScripts.length === 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':white_check_mark: Successfully deleted user_storage :white_check_mark:')
                        .setDescription(`**I successfully wiped the user_storage but there were no scripts to delete!**`)
                        .setColor(ee.color)
                    ],
                    ephemeral: true
                });
            }

            try{
                await con.query(`DELETE FROM script_storage WHERE script_apiowner = '${apiKey}'`);
            } catch(error) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(':x: Failed To Delete Script Storage :x:')
                        .setDescription(`**Woops, I failed to execute the delete script_storage query!**`)
                        .setColor(ee.errorColor)
                    ],
                    ephemeral: true
                });
            }

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(':white_check_mark: Successfully deleted user_storage & script_storage :white_check_mark:')
                    .setDescription(`**I successfully wiped the user_storage & script_storage as requested!**`)
                    .setColor(ee.color)
                ],
                ephemeral: true
            });
        }
    }