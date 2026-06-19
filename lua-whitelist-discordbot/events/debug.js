const client = require("../index.js");
const config = require("../botconfig/config.json");

if (config.ENABLE_DEBUG) {

    client.on("debug", async (info) => {
        console.log(info)
    });

}

/*

Code used in this script has been written by original PizzaParadise developer - PGamingHD#0666
Require assistance with scripts? Join the discord and get help right away! - https://discord.gg/pxySje4GPC
Other than that, please do note that it is required if you are using this to mention the original developer
Original Developer - PGamingHD#0666

*/