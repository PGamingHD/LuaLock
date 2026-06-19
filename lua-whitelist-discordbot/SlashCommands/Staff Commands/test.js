    const {
        Client,
        CommandInteraction,
        MessageEmbed,
        MessageActionRow,
        MessageButton
    } = require('discord.js');
    const ee = require('../../botconfig/embed.json');
    const emoji = require('../../botconfig/embed.json')
    const prettyMilliseconds = require('pretty-ms');
    const config = require('../../botconfig/config.json')
 
    module.exports = {
        name: 'test',
        description: 'Test future features',
        DeveloperCommand: true,
        /** 
         * @param {Client} client 
         * @param {Message} message 
         * @param {String[]} args 
         */
        run: async (client, interaction, args, con) => {

            // FIND ALLOWED-ID BY KEY VALUE!
            /*const [script, scriptRows] = await con.query(`SELECT * FROM script_storage WHERE script_id = '1949953' AND script_apiowner = 'lualock-1'`);
            const [search, searching] = await con.query(`SELECT JSON_SEARCH('${JSON.stringify(script[0].script_keys)}', 'one', 'lualock-2')`);
            const keyPlace = Object.values(search[0])[0].split('.')[0];

            console.log(keyPlace)

            const [testing, testing2] = await con.query(`SELECT JSON_EXTRACT('${JSON.stringify(script[0].script_keys)}', '${keyPlace}')`);

            const allowedId = Object.values(testing[0])[0]['allowed-id'];

            console.log(allowedId)*/

            // PUSH NEW ALLOWED-ID BY KEY VALUE!
            /*const [script, scriptRows] = await con.query(`SELECT * FROM script_storage WHERE script_id = '1949953' AND script_apiowner = 'lualock-1'`);
            const [search, searching] = await con.query(`SELECT JSON_SEARCH('${JSON.stringify(script[0].script_keys)}', 'one', 'lualock-2')`);

            const keyPlace = Object.values(search[0])[0].split('.')[0];

            const [testing, testing2] = await con.query(`UPDATE script_storage SET script_keys = JSON_SET('${JSON.stringify(script[0].script_keys)}', '${keyPlace}', CAST('{"scriptkey": "lualock-2", "allowed-id": "0"}' AS JSON));`)*/
        }
    }