const chalk = require('chalk');


module.exports = async (client) => {
    process.on('unhandledRejection', (reason, p) => {
        console.log(chalk.red(' [ANTICRASH] <==> || Unhandled Rejection/Catch || <==> [ANTICRASH]'));
        console.log(reason, p);
    });
    process.on("uncaughtException", (err, origin) => {
        console.log(chalk.red(' [ANTICRASH] <==> || Uncaught Exception/Catch || <==> [ANTICRASH]'));
        console.log(err, origin);
    })
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        console.log(chalk.red(' [ANTICRASH] <==>  || Uncaught Exception/Catch (MONITOR) || <==> [ANTICRASH]'));
        console.log(err, origin);
    });
}

/*

Code used in this script has been written by original PizzaParadise developer - PGamingHD#0666
Require assistance with scripts? Join the discord and get help right away! - https://discord.gg/pxySje4GPC
Other than that, please do note that it is required if you are using this to mention the original developer
Original Developer - PGamingHD#0666

*/