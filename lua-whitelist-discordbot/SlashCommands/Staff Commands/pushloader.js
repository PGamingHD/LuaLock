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
    const axios = require("axios");
    const Luraph = require("luraph").Luraph;
    const api = new Luraph(process.env.LURAPH_API_TOKEN);

    module.exports = {
        name: 'pushloader',
        description: 'Push a new loader script to all existing scripts!',
        DeveloperCommand: true,
        commandCooldown: 5,
        options: [{
            name: 'newloader',
            description: 'The script containing the new loader!',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
        }],
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            const scriptFile = interaction.options.getAttachment('newloader');
            const response = await axios.get(scriptFile.attachment);
            const script = response.data;

            await interaction.reply({
                content: ':warning: Loading...',
                ephemeral: true
            });
            const [totalLoaders, loaderRows] = await con.query(`SELECT * FROM script_storage`);

            totalLoaders.forEach(async (loader) => {
                const scriptId = loader.script_id;
                const scriptName = loader.script_name;
                const finalLoader = script.replace("INSERTSCRIPTID", `${scriptId}`);

                const nodes = await api.getNodes();

                const options = {
                    INTENSE_VM_STRUCTURE: true,
                    ENABLE_GC_FIXES: true,
                    TARGET_VERSION: 'Luau Handicapped',
                    VM_ENCRYPTION: true,
                    DISABLE_LINE_INFORMATION: true,
                    USE_DEBUG_LIBRARY: true,
                };

                const loaderScript = await api.createNewJob(nodes.recommendedId, `${finalLoader}`, `loader_${scriptName}.lua`, options);

                const loaderStatus = await api.getJobStatus(loaderScript.jobId);

                if (loaderStatus.success) {
                    const loader_sc = await api.downloadResult(loaderScript.jobId);

                    const script = `script_key = "PASTESCRIPTKEYHERE";
    --[[
    
                        This script has been licensed using LuaLock
                    Unauthorized usage of this script is strictly forbidden.
            Any attempt of tampering, reverse engineering or modifying the scripts source
        or internal logic will result in a global ban, and get you blacklisted from future
                    script executions that has been licensed with Lualock.
    
                        LuaLock v1.1 for Roblox, made by PGamingHD#0666
                                    https://lualock.com/
    
    
                    ██╗░░░░░██╗░░░██╗░█████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗
                    ██║░░░░░██║░░░██║██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝
                    ██║░░░░░██║░░░██║███████║██║░░░░░██║░░██║██║░░╚═╝█████═╝░
                    ██║░░░░░██║░░░██║██╔══██║██║░░░░░██║░░██║██║░░██╗██╔═██╗░
                    ███████╗╚██████╔╝██║░░██║███████╗╚█████╔╝╚█████╔╝██║░╚██╗
                    ╚══════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝
             
                                     Script ID: ${scriptId}
    
    --]]
    
    
    `;
                    const loader_actualScript = script + loader_sc.data.split("\n")[2].toString();
                    const LOADER_FILE = Buffer.from(loader_actualScript, 'utf8').toString('hex');

                    await con.query(`UPDATE script_storage SET loader_script = x'${LOADER_FILE}' WHERE script_id = '${scriptId}'`);
                } else {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(ee.errorColor)
                            .setTitle(":x: Obfuscation Error :x:")
                            .setDescription(`**Woops, looks like I ran into an error while obfuscating the new loader script, please view the error or re-execute!**`)
                        ],
                        content: ''
                    })
                }
            });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(ee.color)
                    .setTitle(":white_check_mark: New Loader Pushed :white_check_mark:")
                    .setDescription(`**Successfully pushed all loaders to existing scripts!**`)
                ],
                content: ''
            });
        }
    }