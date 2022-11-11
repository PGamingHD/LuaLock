const {
    EmbedBuilder,
    WebhookClient,
} = require("discord.js");
const FlakeId = require("flakeid");
const flake = new FlakeId({
    mid: 42, //optional, define machine id
    timeOffset: (2022 - 1970) * 31536000 * 1000 //optional, define a offset time
});

//MODULE EXPORTS
module.exports.escapeRegex = escapeRegex;
module.exports.escapeRegex = escapeRegex;
module.exports.sendWebhook = sendWebhook;
module.exports.generateKey = generateKey;
module.exports.generateSnowflake = generateSnowflake;
//FUNCTIONS

function escapeRegex(str) {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

function escapeRegex(str) {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

async function sendWebhook(webhookLink, webhookTitle, webhookDesc, webhookColor) {
    const webhook = new WebhookClient({
        url: webhookLink
    });

    await webhook.send({
        embeds: [
            new EmbedBuilder()
            .setColor(webhookColor)
            .setTitle(webhookTitle)
            .setDescription(webhookDesc)
            .setTimestamp()
        ]
    });
}

function generateKey() {
    return "lualock-" + require('crypto').randomBytes(16).toString('hex');
}

function generateSnowflake() {
    return flake.gen();
}