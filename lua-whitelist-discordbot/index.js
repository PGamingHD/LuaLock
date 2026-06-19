//           --------------------<CONSTRUCTORS>--------------------

const {
    Client,
    Collection,
    Intents,
    GatewayIntentBits,
    Partials,
    IntentsBitField
} = require("discord.js");
const {
    readdirSync,
    readdir
} = require("fs");
const config = require("./botconfig/config.json");
const chalk = require("chalk");
const mysql = require('mysql2/promise');
require('dotenv').config();


//           --------------------<CONSTRUCTORS>--------------------


//           --------------------<CONSTRUCTING CLIENTS>--------------------

const client = new Client({
    allowedMentions: {
        parse: ["users"], // "everyone", "roles", "users"
        repliedUser: false,
    },
    waitGuildTimeout: 10000,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],

    partials: [
        Partials.ActivityType,
    ],
});

//           --------------------<CONSTRUCTING CLIENTS>--------------------


//           --------------------<MODULE EXPORTS>--------------------

module.exports = client;

//           --------------------<MODULE EXPORTS>--------------------


//           --------------------<GLOBAL VARIABLES CONSTRUCTION>--------------------

client.commandCooldown = new Collection();
client.slashCommands = new Collection();
client.slashcategories = readdirSync("./SlashCommands/");
client.config = require("./botconfig/config.json");
client.updateStatus = false;

//           --------------------<GLOBAL VARIABLES CONSTRUCTION>--------------------


//           --------------------<REQUIRES>--------------------

require("./handler/anticrash")(client);
// Initializing the project
require("./handler")(client);
//require("./database/db")

//           --------------------<REQUIRES>--------------------


//

async function dbConnection() {

    const connection = await mysql.createConnection({

        //DATABASE CREDENTIALS

        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DATABASE,

        //DATABASE SETTINGS

        supportBigNumbers: true,
    }).then(console.log(chalk.green("[DATABASE] <==> || Connection has been successfully established with the Database! || <==> [DATABASE]")));

    client.connection = connection;

}

//


//           --------------------<STARTING ARGUMENTS>--------------------

dbConnection();

client.login(process.env.LOGIN_TOKEN).catch(() => {
    console.log(chalk.red("[LOGIN] <==> || Failed to login due to token being invalid, please fix this asap! || <==> [LOGIN]"))
});

//           --------------------<STARTING ARGUMENTS>--------------------