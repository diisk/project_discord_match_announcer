import { sleep } from "./utils";
import { Client, Intents } from 'discord.js';
//const { Client, Collection, Intents } = require('discord.js');

var teste: string[] = [];

const client: any = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
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



