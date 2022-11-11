    const {
        Client,
        CommandInteraction,
        MessageEmbed,
        MessageActionRow,
        MessageButton
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json');
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json');
    const axios = require("axios");
    const qs = require("qs");

    module.exports = {
        name: 'test',
        description: 'Testing',
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {
            /*const data = [{
                ip: '83.233.247.36',
                comment: 'PGamingHD/Owner'
            }]

            axios.get("https://api.cloudflare.com/client/v4/accounts/f746d867dfe1e554d8a2945486da38f4/rules/lists/45cc043a30df4d12b2bdad285a164c41/items", data, {
                headers: {
                    'content-type': 'application/json',
                    'X-Auth-Email': 'pontus.2003@hotmail.com',
                    'Authorization': 'Bearer 0xFlHS9zMn6B1oDPiOnD95lfQbVeGGpf6uFmtisM'
                }
            }).then(function (response) {
                console.log(response)
            })*/

            //const [keys, keys2] = await con.query(`SELECT COUNT(*) FROM script_storage WHERE script_apiowner = 'lualock-3cda98da7c32d52d331c2386ccc35ba9'`);
            //console.log(keys)
        }
    }