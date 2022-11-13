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
        name: 'genkey',
        description: 'Generate a key with a specific subscription type.',
        DeveloperCommand: true,
        commandCooldown: 5,
        options: [{
            name: 'type',
            description: 'The type of key you want to generate.',
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
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const keyLength = interaction.options.getString('type');
            const generatedKey = generateKey();

            if (keyLength === "pro") {
                await con.query(`INSERT INTO prokeys (licensekey) VALUES ('${generatedKey}')`);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:white_check_mark: Key successfully generated :white_check_mark:`)
                        .setDescription(`*The generated key can be used to redeem our product!*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${generatedKey}\``
                        }, {
                            name: 'Key Type',
                            value: '\`Pro\`'
                        }])
                    ]
                });
            } else if (keyLength === "premium") {
                await con.query(`INSERT INTO premiumkeys (licensekey) VALUES ('${generatedKey}')`);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:white_check_mark: Key successfully generated :white_check_mark:`)
                        .setDescription(`*The generated key can be used to redeem our product!*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${generatedKey}\``
                        }, {
                            name: 'Key Type',
                            value: '\`Premium\`'
                        }])
                    ]
                });
            } else if (keyLength === "vip") {
                await con.query(`INSERT INTO vipkeys (licensekey) VALUES ('${generatedKey}')`);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`:white_check_mark: Key successfully generated :white_check_mark:`)
                        .setDescription(`*The generated key can be used to redeem our product!*`)
                        .setColor(ee.color)
                        .addFields([{
                            name: 'Key',
                            value: `\`${generatedKey}\``
                        }, {
                            name: 'Key Type',
                            value: '\`Vip\`'
                        }])
                    ]
                });
            }
        }
    }