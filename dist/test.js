"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
//const { Client, Collection, Intents } = require('discord.js');
var teste = [];
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
client.login("OTE0NjAyMTI1MDA5NTE0NDk2.YaPbmw.hkeXH4J0GOdl8WKINceLobzBZIY");
client.once('ready', () => {
    setInterval(() => {
        if (teste.length > 0) {
            client.channels.cache.get("582239954437144605").send(teste[0]);
            teste.splice(0, 1);
        }
    }, 1000);
});
teste.push("<@DiisK#3952>(Jhin)");
//# sourceMappingURL=test.js.map