"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const champion_1 = __importDefault(require("./champion"));
const stats_1 = __importDefault(require("./stats"));
const config_json_1 = require("./config.json");
const summoner_1 = require("./summoner");
var client;
var announces = [];
var cooldowns = [];
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
    static getEmbedStats(summoner) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield stats_1.default.getStats(summoner.dbId);
            let obs = "";
            const embed = new discord_js_1.MessageEmbed()
                .setColor('#FFFFFF')
                .setThumbnail(config_json_1.deathImageURL)
                .setTitle(`Estatísticas de ${summoner.name}`)
                .setAuthor({ name: 'Deathspectator', iconURL: config_json_1.karthusImageURL })
                .setTimestamp()
                .addFields({ name: 'Posição', value: `${stats.totalDeathsPos}.`, inline: true }, { name: 'Total de mortes', value: `${stats.totalDeaths}`, inline: true }, { name: 'Média por partida', value: `${stats.perGameDeathAverage}`, inline: true })
                .setDescription(`Resumo de ${summoner.discordMention}\n`);
            if (stats.totalDeathsDif > 0) {
                obs += `Morreu ${stats.totalDeathsDif} mais vezes do que a média de mortes do servidor.\n`;
            }
            else if (stats.totalDeathsDif < 0) {
                obs += `Morreu ${stats.totalDeathsDif} menos vezes do que a média de mortes do servidor.\n`;
            }
            let champName = champion_1.default.getChampionBy(stats.topDeathsGame.champion_key).name;
            embed.addFields({ name: 'Top Mortes Partida Única', value: `Rank: ${stats.topDeathsGame.totalDeathsPos}`, inline: true }, { name: 'Campeão', value: `${champName}`, inline: true }, { name: 'Mortes', value: `${stats.topDeathsGame.totalDeaths}`, inline: true });
            let m = stats.topDeathsGame.perGameDeathAverageDif;
            if (m != 0) {
                obs += `Morreu ${m > 0 ? `${m}% mais` : `${m * -1}% menos`} do que a média do servidor em uma única partida com ${champName}.\n`;
            }
            if (stats.mostPlayedChampion.key == stats.topDeathsChampion.key) {
                champName = champion_1.default.getChampionBy(stats.mostPlayedChampion.key).name;
                embed.addFields({ name: 'Campeão destaque', value: `${champName}`, inline: true }, { name: 'Pos(Rank Geral)', value: `${stats.mostPlayedChampion.totalDeathsPos}`, inline: true }, { name: 'Total/Média de mortes', value: `${stats.mostPlayedChampion.totalDeaths} / ${stats.mostPlayedChampion.perGameDeathAverage}`, inline: true });
                m = stats.mostPlayedChampion.perGameDeathAverageDif;
                if (m == 0) {
                    obs += `${champName} é o seu campeão mais jogado e também o campeão com mais mortes.\n`;
                }
                else {
                    obs += `${champName} é o seu campeão mais jogado e também o campeão com mais mortes, com ele você morre 
				${m > 0 ? `${m}% mais` : `${m * -1}% menos`} do que a média do servidor.\n`;
                }
            }
            else {
                champName = champion_1.default.getChampionBy(stats.topDeathsChampion.key).name;
                embed.addFields({ name: 'Campeão com mais mortes', value: `${champName}`, inline: true }, { name: 'Pos(Rank Geral)', value: `${stats.topDeathsChampion.totalDeathsPos}`, inline: true }, { name: 'Total/Média de mortes', value: `${stats.topDeathsChampion.totalDeaths} / ${stats.topDeathsChampion.perGameDeathAverage}`, inline: true });
                m = stats.topDeathsChampion.perGameDeathAverageDif;
                if (m != 0) {
                    obs += `Morreu ${m > 0 ? `${m}% mais` : `${m * -1}% menos`} do que a média do servidor com ${champName}.\n`;
                }
                champName = champion_1.default.getChampionBy(stats.mostPlayedChampion.key).name;
                embed.addFields({ name: 'Campeão mais jogado', value: `${champName}`, inline: true }, { name: 'Pos(Rank Geral)', value: `${stats.mostPlayedChampion.totalDeathsPos}`, inline: true }, { name: 'Total/Média de mortes', value: `${stats.mostPlayedChampion.totalDeaths} / ${stats.mostPlayedChampion.perGameDeathAverage}`, inline: true });
                m = stats.mostPlayedChampion.perGameDeathAverageDif;
                if (m != 0) {
                    obs += `Morreu ${m > 0 ? `${m}% mais` : `${m * -1}% menos`} do que a média do servidor com ${champName}.\n`;
                }
            }
            embed.addFields({ name: 'Destaques:', value: obs, inline: false });
            return embed;
        });
    }
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
        client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.author.bot)
                return;
            if (!message.content.startsWith(config_json_1.prefix))
                return;
            if (!cooldowns.includes(message.author.id)) {
                const sums = (0, summoner_1.getSummoners)();
                for (let i in sums) {
                    if (sums[i].discordId == message.author.id) {
                        message.reply({ embeds: [yield this.getEmbedStats(sums[i])] });
                        break;
                    }
                }
                addInCooldown(message.author.id);
            }
            else {
                message.reply("Epa, pera lá, muita calma, ladrão, cadê o espírito imortal do capão?");
            }
        }));
        client.once('ready', () => {
            setInterval(() => {
                if (announces.length > 0) {
                    const embed = announces[0];
                    announces.splice(0, 1);
                    client.channels.cache.get(config_json_1.channelId).send({ embeds: [embed] });
                }
            }, 200);
        });
    }
}
function addInCooldown(discordId) {
    cooldowns.push(discordId);
    const id = discordId;
    setTimeout(() => {
        if (cooldowns.includes(id)) {
            for (let i = 0; i < cooldowns.length; i++) {
                if (cooldowns[i] == id) {
                    cooldowns.splice(i, 1);
                    break;
                }
            }
        }
    }, 2000);
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