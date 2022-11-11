const {
    EmbedBuilder,
} = require("discord.js");
const client = require("../index.js");
const ee = require("../botconfig/embed.json");
const config = require("../botconfig/config.json");
const prettyMilliseconds = require('pretty-ms');

client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild) return;

    // Slash Command Handling
    if (interaction.isChatInputCommand()) {

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) {
            let embed = new EmbedBuilder()
                .setColor(ee.color)
                .setDescription("Command could not be found, contact the developer!")
            return interaction.reply({
                embeds: [embed],
                epehemeral: true
            });
        }

        if (client.commandCooldown.has(`${interaction.user.id},${cmd.name}`)) {
            const usercd = await client.commandCooldown.get(`${interaction.user.id},${cmd.name}`);
            let prettified = prettyMilliseconds(usercd - Date.now(), {
                verbose: true
            });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.errorColor)
                    .setDescription(`**Woops, looks like you are on a cooldown for this command for another *${prettified}*!**`)
                ],
                ephemeral: true
            })
        }

        if (cmd.DeveloperCommand && !config.DEVELOPER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.errorColor)
                    .setTitle(":x: Missing Permissions :x:")
                    .setDescription("It looks like the executed command is a **Developer Only** command!")
                ],
                ephemeral: true
            });
        }

        if (cmd?.commandCooldown) {
            let expireDate = Date.now() + 1000 * cmd?.commandCooldown;
            await client.commandCooldown.set(`${interaction.user.id},${cmd.name}`, expireDate);

            setTimeout(async () => {
                await client.commandCooldown.delete(`${interaction.user.id},${cmd.name}`);
            }, 1000 * cmd?.commandCooldown);
        }

        //INTERACTION BELOW
        const args = [];
        const con = client.connection;

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        try {
            await cmd.run(client, interaction, args, con);
        } catch (error) {
            console.log(error)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.errorColor)
                    .setFooter({
                        text: 'Please report the error message above to the Bot Developer!'
                    })
                    .setTitle(`:x: Something went wrong while running the \`${cmd.name}\` command!`)
                    .setDescription(`\`\`\`${error.message}\`\`\``)
                ],
                ephemeral: true
            })
        }
    }

    // Context Menu Handling
    /*
    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({
            ephemeral: false
        });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }
    */

    if (interaction.isButton()) {
        const {
            member,
            channel,
            message,
            user,
            guild
        } = interaction;

        //TRY TO USE COLLECTORS INSTEAD OF THIS! (WILL SURVIVE FOREVER)
    }
});

/*

Code used in this script has been written by original PizzaParadise developer - PGamingHD#0666
Require assistance with scripts? Join the discord and get help right away! - https://discord.gg/pxySje4GPC
Other than that, please do note that it is required if you are using this to mention the original developer
Original Developer - PGamingHD#0666

*/