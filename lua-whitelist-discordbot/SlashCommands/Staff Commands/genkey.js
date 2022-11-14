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
        }, {
            name: 'hidekey',
            description: 'Wether you want to display the key to everyone or not',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const keyLength = interaction.options.getString('type');
            const hideKey = interaction.options.getBoolean('hidekey');
            const generatedKey = generateKey();

            if (keyLength === "pro") {
                await con.query(`INSERT INTO prokeys (licensekey) VALUES ('${generatedKey}')`);

                if (hideKey) {
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
                        ],
                        ephemeral: true
                    });
                } else {
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
                }
            } else if (keyLength === "premium") {
                await con.query(`INSERT INTO premiumkeys (licensekey) VALUES ('${generatedKey}')`);

                if (hideKey) {
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
                        ],
                        ephemeral: true
                    });
                } else {
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
                }
            } else if (keyLength === "vip") {
                await con.query(`INSERT INTO vipkeys (licensekey) VALUES ('${generatedKey}')`);

                if (hideKey) {
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
                        ],
                        ephemeral: true
                    });
                } else {
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
    }