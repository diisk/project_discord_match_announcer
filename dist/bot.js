"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const champion_1 = __importDefault(require("./champion"));
const config_json_1 = require("./config.json");
var client;
var announces = [];
const exampleEmbed = new discord_js_1.MessageEmbed()
    .setColor('#b11616')
    .setTitle('MiB DiisK')
    .setAuthor({ name: 'Deathspectator', iconURL: config_json_1.karthusImageURL })
    .setDescription('Some description here')
    .setThumbnail(config_json_1.deathImageURL)
    .addFields({ name: 'Regular field title', value: 'Some value here' }, { name: '\u200B', value: '\u200B' }, { name: 'Inline field title', value: 'Some value here', inline: false }, { name: 'Inline field title', value: 'Some value here', inline: true })
    .addField('Inline field title', 'Some value here', true)
    //.setImage(deathImageURL)
    .setTimestamp();
//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
class Bot {
    static sendRankAnnounce(rank, notes) {
        const { title, description, thumbURL, fields } = getRankData(rank);
        console.log(fields);
        const embed = new discord_js_1.MessageEmbed()
            .setColor('#000000')
            .setTitle(title)
            .setAuthor({ name: 'Deathspectator', iconURL: config_json_1.karthusImageURL })
            .setDescription(description)
            .addFields(fields)
            .addField("Obs:", notes)
            .setTimestamp();
        if (thumbURL) {
            embed.setThumbnail(thumbURL);
        }
        announces.push(embed);
    }
    static sendStartSoloPlaying(summoner, gameMode, queueName) {
        let championName = "error";
        if (summoner.actualMatch) {
            championName = champion_1.default.getChampionBy(summoner.actualMatch.championId);
            if (championName) {
                championName = championName.name;
            }
            else {
                championName = "error";
            }
        }
        const embed = new discord_js_1.MessageEmbed()
            .setColor('#02de7f')
            .setThumbnail(config_json_1.amumuImageURL)
            .setTitle(`Jogando ${(queueName ? queueName : gameMode).toLowerCase()} solo`)
            .setAuthor({ name: 'Deathspectator', iconURL: config_json_1.karthusImageURL })
            .setDescription(`${summoner.name} vulgo ${summoner.discordMention}`)
            .addField("Campeão", championName)
            .setTimestamp();
        announces.push(embed);
    }
    static sendStartGroupPlaying(summoners, gameMode, queueName) {
        const fields = [];
        for (let i = 0; i < summoners.length; i++) {
            const sum = summoners[i];
            let championName = "error";
            if (sum.actualMatch) {
                const champ = champion_1.default.getChampionBy(sum.actualMatch.championId);
                if (champ) {
                    championName = champ.name;
                }
            }
            if (i == 0) {
                fields.push({ name: 'Nick', value: sum.name, inline: true });
                fields.push({ name: 'Campeão', value: championName, inline: true });
                fields.push({ name: 'Discord', value: sum.discordMention, inline: true });
            }
            else {
                fields.push({ name: '\u200B', value: sum.name, inline: true });
                fields.push({ name: '\u200B', value: championName, inline: true });
                fields.push({ name: '\u200B', value: sum.discordMention, inline: true });
            }
        }
        const embed = new discord_js_1.MessageEmbed()
            .setColor('#b11616')
            .setTitle(`${queueName ? queueName : gameMode} com os parças`)
            .setAuthor({ name: 'Deathspectator', iconURL: config_json_1.karthusImageURL })
            .setDescription(`Estão jogando agora:`)
            .addFields(fields)
            .setImage(config_json_1.defeatImageURL)
            .setTimestamp();
        announces.push(embed);
    }
    static initialize() {
        client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
        client.login(config_json_1.discord_token);
        client.on('messageCreate', (message) => {
            //TRATAR AS MSGS
        });
        client.once('ready', () => {
            setInterval(() => {
                if (announces.length > 0) {
                    const embed = announces[0];
                    announces.splice(0, 1);
                    client.channels.cache.get(config_json_1.channelId).send({ embeds: [embed] });
                }
            }, 200);
            // const rank:Rank = {
            // 	name:"Zeri",
            // 	elements:[
            // 		{
            // 			key:{name:"MiB DiisK"},
            // 			value:80
            // 		},
            // 		{
            // 			key:{name:"MiB DiisK"},
            // 			value:80
            // 		},
            // 		{
            // 			key:{name:"MiB DiisK"},
            // 			value:80
            // 		},
            // 		{
            // 			key:{name:"MiB DiisK"},
            // 			value:80
            // 		},
            // 		{
            // 			key:{name:"MiB DiisK"},
            // 			value:80
            // 		},
            // 	]
            // }
            // this.sendRankAnnounce(rank,"TESTE");
        });
    }
}
function getRankData(rank) {
    let rankData;
    switch (rank.name) {
        case "gameDeathRank":
            rankData = {
                title: "Top 5 (Geral)",
                description: "Mortes em uma única partida.",
                thumbURL: config_json_1.unicaImageURL,
                fields: []
            };
            for (let i = 0; i < rank.elements.length; i++) {
                let championName = champion_1.default.getChampionBy(rank.elements[i].key.championKey);
                if (championName) {
                    championName = championName.name;
                }
                else {
                    championName = "error";
                }
                if (i == 0) {
                    rankData.fields.push({ name: "Pos/Nick", value: `1. ${rank.elements[i].key.summoner.name}`, inline: true });
                    rankData.fields.push({ name: "Mortes", value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: "Campeão", value: championName, inline: true });
                }
                else {
                    rankData.fields.push({ name: '\u200B', value: `${i + 1}. ${rank.elements[i].key.summoner.name}`, inline: true });
                    rankData.fields.push({ name: '\u200B', value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: '\u200B', value: championName, inline: true });
                }
            }
            break;
        case "sGameDeathRank":
            rankData = {
                title: "Top 5 (Pessoal)",
                description: "Mortes em uma única partida.",
                thumbURL: config_json_1.pessoalImageURL,
                fields: []
            };
            for (let i = 0; i < rank.elements.length; i++) {
                let championName = champion_1.default.getChampionBy(rank.elements[i].key);
                if (championName) {
                    championName = championName.name;
                }
                else {
                    championName = "error";
                }
                if (i == 0) {
                    rankData.fields.push({ name: "Posição", value: '1.', inline: true });
                    rankData.fields.push({ name: "Campeão", value: championName, inline: true });
                    rankData.fields.push({ name: "Mortes", value: rank.elements[i].value + "", inline: true });
                }
                else {
                    rankData.fields.push({ name: "\u200B", value: `${i + 1}.`, inline: true });
                    rankData.fields.push({ name: "\u200B", value: championName, inline: true });
                    rankData.fields.push({ name: "\u200B", value: rank.elements[i].value + "", inline: true });
                }
            }
            break;
        case "totalDeathRank":
            rankData = {
                title: "Top 5 (Geral)",
                description: "Mortes no total.",
                thumbURL: config_json_1.totalImageURL,
                fields: []
            };
            for (let i = 0; i < rank.elements.length; i++) {
                if (i == 0) {
                    rankData.fields.push({ name: "Posição", value: '1.', inline: true });
                    rankData.fields.push({ name: "Mortes", value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: "Nick", value: rank.elements[i].key.name, inline: true });
                }
                else {
                    rankData.fields.push({ name: "\u200B", value: `${i + 1}.`, inline: true });
                    rankData.fields.push({ name: "\u200B", value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: "\u200B", value: rank.elements[i].key.name, inline: true });
                }
            }
            break;
        default:
            let champ = champion_1.default.getChampionBy(rank.name);
            let champId = null;
            if (champ) {
                champId = champ.id;
                champ = champ.name;
            }
            else {
                champ = "error";
            }
            rankData = {
                title: "Top 5 (Geral)",
                description: `Total de mortes com ${champ}.`,
                thumbURL: getChampionImageURL(champId),
                fields: []
            };
            for (let i = 0; i < rank.elements.length; i++) {
                if (i == 0) {
                    rankData.fields.push({ name: "Posição", value: '1.', inline: true });
                    rankData.fields.push({ name: "Mortes", value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: "Nick", value: rank.elements[i].key.name, inline: true });
                }
                else {
                    rankData.fields.push({ name: "\u200B", value: `${i + 1}.`, inline: true });
                    rankData.fields.push({ name: "\u200B", value: rank.elements[i].value + "", inline: true });
                    rankData.fields.push({ name: "\u200B", value: rank.elements[i].key.name, inline: true });
                }
            }
            break;
    }
    return rankData;
}
function getChampionImageURL(championId) {
    if (championId) {
        return `https://blitz-cdn.blitz.gg/blitz/lol/champion/${championId}.webp`;
    }
    return null;
}
exports.default = Bot;
//# sourceMappingURL=bot.js.map