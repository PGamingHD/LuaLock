const client = require("../index");
const config = require("../botconfig/config.json");
const emoji = require("../botconfig/emojis.json");
const {
    Cron
} = require("croner");
const {spawn, exec, execSync} = require("child_process");
const {
    ActivityType,
    Interaction
} = require("discord.js");
const chalk = require("chalk");

client.on("ready", async (client) => {
    try {
        try {
            console.log(chalk.green(`[LOGIN] <==> || I successfully logged into ${client.user.tag} and started ALL services || <==> [LOGIN]`));
        } catch (error) {
            console.log(error)
        }

        client.user.setActivity('Lualock Services', {
            type: ActivityType.Watching
        });

        Cron('0 0 */1 * * *', async () => {
            await client.connection.query(`SELECT 1`);
        });
    } catch (e) {
        console.log(String(e.stack))
    }
});

/*

Code used in this script has been written by original PizzaParadise developer - PGamingHD#0666
Require assistance with scripts? Join the discord and get help right away! - https://discord.gg/pxySje4GPC
Other than that, please do note that it is required if you are using this to mention the original developer
Original Developer - PGamingHD#0666

*/