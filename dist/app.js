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
const connection_1 = __importDefault(require("./connection"));
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
const config_json_1 = require("./config.json");
const fetch = require('node-fetch');
const champions = [];
const loadedMatchs = [];
const summoners = [];
var requestCounter = 0;
var requestStartDate;
var requestEndDate;
var ranks = [];
var announces = [];
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
client.login("OTM1MDA1MzY4NTIwNjcxMjY0.Ye4Vmw.YPVgVUeNUlEQipgCP-iCQN1Stt8");
client.once('ready', () => {
    setInterval(() => {
        if (announces.length > 0) {
            client.channels.cache.get("850536066741698590").send(announces[0]);
            announces.splice(0, 1);
        }
    }, 200);
});
class Summoner {
    constructor(name, discordTag, dbId, summonerIds, gameDeathRank) {
        this.actualMatch = null;
        this.lastPlayed = null;
        this.name = name;
        this.discordMention = discordTag;
        this.dbId = dbId;
        this.id = summonerIds.id;
        this.puuid = summonerIds.puuid;
        this.accountId = summonerIds.accountId;
        this.gameDeathRank = gameDeathRank;
    }
}
class Match {
    constructor(matchId) {
        this.participants = [];
        this.gameId = matchId;
    }
    addParticipant(participant) {
        this.participants.push(participant);
    }
    getParticipant(name) {
        for (let i in this.participants) {
            if (this.participants[i].summonerName.toLowerCase() == name.toLowerCase()) {
                return this.participants[i];
            }
        }
        return null;
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield loadChampions();
    yield loadSummoners();
    yield loadAllRanks();
    const loop = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            for (let i in summoners) {
                yield updateSummoner(summoners[i]);
                yield checkAndSendAnnounces(summoners[i]);
            }
            loadedMatchs.length = 0;
        }
        catch (err) {
            console.log(err);
        }
        setTimeout(loop, 4000);
    });
    loop();
}))();
function getChampionName(id) {
    for (let i in champions) {
        if (champions[i].id == id) {
            return champions[i].name;
        }
    }
    return "";
}
function loadChampions() {
    return __awaiter(this, void 0, void 0, function* () {
        let champs = yield request("http://ddragon.leagueoflegends.com/cdn/12.2.1/data/en_US/champion.json");
        champs = champs.data;
        const keys = Object.keys(champs);
        for (let i in keys) {
            let name = keys[i];
            switch (name.toLowerCase()) {
                case "monkeyking":
                    name = "Wukong";
                    break;
            }
            champions.push({
                name: name,
                id: champs[keys[i]].key
            });
        }
    });
}
function updateSummoner(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updatePlaying(summoner);
        yield updateDeaths(summoner);
    });
}
function checkAndSendAnnounces(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        yield checkAndSendPlaying(summoner);
        yield checkAndSendDeaths(summoner);
    });
}
function checkAndSendPlaying(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        if (summoner.actualMatch) {
            switch (summoner.actualMatch.announceState) {
                case "checking":
                    summoner.actualMatch.announceState = "finished";
                    if (summoner.lastPlayed) {
                        if ((0, utils_1.timeBetweenDates)(new Date(), summoner.lastPlayed) < 20 * 60 * 1000) { //20 minutos
                            return;
                        }
                    }
                    const playing = [summoner];
                    for (let i in summoners) {
                        const otherSum = summoners[i];
                        if (otherSum.discordMention != summoner.discordMention) {
                            if (otherSum.actualMatch) {
                                if (otherSum.actualMatch.gameId == summoner.actualMatch.gameId) {
                                    otherSum.actualMatch.announceState = "finished";
                                    playing.push(otherSum);
                                }
                            }
                        }
                    }
                    sendAnnouce(getPlayingMessage(playing));
                    break;
                case "started":
                    summoner.actualMatch.announceState = "checking";
                    break;
            }
        }
    });
}
function getPlayingMessage(playing) {
    let message = "";
    const am = playing[0].actualMatch;
    if (am) {
        let gameMode;
        let queueName;
        switch (am.gameMode.toLowerCase()) {
            case "aram":
                gameMode = " aranzinho";
                break;
            case "classic":
                gameMode = "a normalzinha";
                break;
            case "odyssey":
                gameMode = "a odisseyazinha G O D";
                break;
            case "kingporo":
                gameMode = " kingporo";
                break;
            default:
                gameMode = " modo lixo";
                break;
        }
        switch (am.queueId) {
            case 420:
                queueName = "a rankedzinha";
                break;
            case 440:
                queueName = "a flexzinha";
                break;
            default:
                queueName = "";
                break;
        }
        if (playing.length > 1) {
            for (let i = 0; i < playing.length; i++) {
                const sum = playing[i];
                if (sum.actualMatch) {
                    if (i != 0) {
                        if (i == playing.length - 1) {
                            message += " e ";
                        }
                        else {
                            message += ", ";
                        }
                    }
                    message += `${sum.discordMention}(${sum.actualMatch.actualChampion})`;
                }
            }
            message += ` estão jogando um${queueName.length > 0 ? queueName : gameMode} nesse exato momento.`;
        }
        else {
            const sum = playing[0];
            message = `${sum.discordMention} o FAMOSO, está jogando um${queueName.length > 0 ? queueName : gameMode} com esse champ lixo chamado ${am.actualChampion}.`;
        }
    }
    return message;
}
function sendAnnouce(message) {
    announces.push(message);
}
function checkAndSendDeaths(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        const ngdr = yield getGameDeathRank(summoner.dbId);
        if (summoner.gameDeathRank.elements.length > 0 && ngdr.elements.length > 0) {
            const oldEls = summoner.gameDeathRank.elements;
            if (ngdr.elements[0].key == oldEls[0].key) {
                if (ngdr.elements[0].value != oldEls[0].value) {
                    sendAnnouce(`${summoner.discordMention} possui um novo recorde pessoal de mortes em uma única partida, liderando com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} vezes!`);
                }
            }
            else {
                sendAnnouce(`${summoner.discordMention} bateu o próprio recorde pessoal de mortes com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} em uma única partida!`);
            }
        }
        summoner.gameDeathRank = ngdr;
        for (let i in ranks) {
            let newRank;
            switch (ranks[i].name) {
                case "totalDeathRank":
                    newRank = yield getTotalDeathRank();
                    break;
                case "gameDeathRank":
                    newRank = yield getGameDeathRank();
                    break;
                default:
                    newRank = yield getChampionDeathRank(parseInt(ranks[i].name));
                    break;
            }
            if (ranks[i].elements.length > 0 && newRank.elements.length > 0) {
                const oel = ranks[i].elements[0];
                const nel = newRank.elements[0];
                switch (ranks[i].name) {
                    case "gameDeathRank":
                        if (oel.key.dbId != nel.key.dbId) {
                            sendAnnouce(`${nel.key.summoner.discordMention} ta dando show de ${nel.key.championName}, morreu ${nel.value} em uma única partida, tomando o 1º lugar dessa lixeira de ${oel.key.championName} que o indivíduo ${oel.key.summoner.discordMention} chama de campeão!`);
                        }
                    case "totalDeathRank":
                        if (oel.key.dbId != nel.key.dbId) {
                            sendAnnouce(`${oel.key.discordMention} foi superado por ${nel.key.discordMention} tomando o 1º lugar no ranking geral de mortes com um total de ${nel.value} mortes!`);
                        }
                        break;
                    default:
                        if (oel.key.dbId != nel.key.dbId) {
                            sendAnnouce(`${nel.key.discordMention} ta dando aula de como jogar com ${getChampionName(parseInt(ranks[i].name))}, morreu um total de ${nel.value} vezes tomando o 1º lugar de ${oel.key.discordMention} no ranking total de mortes com o campeão!`);
                        }
                        break;
                }
            }
            ranks[i] = newRank;
        }
    });
}
function loadAllRanks() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i in champions) {
            ranks.push(yield getChampionDeathRank(champions[i].id));
        }
        ranks.push(yield getGameDeathRank());
        ranks.push(yield getTotalDeathRank());
    });
}
function getSummonerBy(dbId) {
    for (let i in summoners) {
        if (summoners[i].dbId == dbId) {
            return summoners[i];
        }
    }
    return null;
}
function getTotalDeathRank() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield connection_1.default.runQuery("SELECT summoner_id,SUM(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5");
        const rank = {
            name: "totalDeathRank",
            elements: []
        };
        for (let i in result) {
            rank.elements.push({ key: getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] });
        }
        return rank;
    });
}
function getGameDeathRank(summonerDbId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rank = {
            name: "gameDeathRank",
            elements: []
        };
        if (summonerDbId) {
            const result = yield connection_1.default.runQuery(`SELECT champion_id,MAX(deaths) FROM deaths_data WHERE summoner_id = ${summonerDbId} GROUP BY game_id ORDER BY MAX(deaths) DESC LIMIT 0,5`);
            rank.name = "sGameDeathRank";
            for (let i in result) {
                rank.elements.push({ key: getChampionName(result[i]["champion_id"]), value: result[i]["MAX(deaths)"] });
            }
        }
        else {
            const result = connection_1.default.runQuery("SELECT summoner_id,champion_id,MAX(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY MAX(deaths) DESC LIMIT 0,5");
            for (let i in result) {
                rank.elements.push({
                    key: {
                        summoner: getSummonerBy(result[i]["summoner_id"]),
                        championName: getChampionName(result[i]["champion_id"])
                    },
                    value: result[i]["MAX(deaths)"]
                });
            }
        }
        return rank;
    });
}
function getChampionDeathRank(championId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield connection_1.default.runQuery(`SELECT summoner_id,SUM(deaths) FROM deaths_data WHERE champion_id = ${championId} GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5`);
        const rank = {
            name: championId + "",
            elements: []
        };
        for (let i in result) {
            rank.elements.push({ key: getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] });
        }
        return rank;
    });
}
function updatePlaying(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield getCurrentGame(summoner.id);
        if (response) {
            const { gameId, gameQueueConfigId, gameMode, participants } = response;
            if (gameMode) {
                if (!summoner.actualMatch) {
                    summoner.actualMatch = getActualMatch(summoner, participants, gameMode, gameQueueConfigId, gameId);
                }
            }
            else {
                if (summoner.actualMatch) {
                    summoner.actualMatch = null;
                    summoner.lastPlayed = new Date();
                }
            }
        }
    });
}
function getActualMatch(summoner, participants, gameMode, gameQueueConfigId, gameId) {
    let actualChampion = "";
    for (let i in participants) {
        if (normalizeSpaces(participants[i].summonerName.toLowerCase()) == summoner.name.toLowerCase()) {
            actualChampion = getChampionName(participants[i].championId);
            break;
        }
    }
    return { announceState: "started", gameId: gameId, actualChampion: actualChampion, gameMode: gameMode, queueId: gameQueueConfigId };
}
function updateDeaths(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchList = yield getLastMatchs(summoner.puuid, 20);
        for (let i in matchList) {
            const result = yield connection_1.default.runQuery(`SELECT id FROM deaths_data WHERE summoner_id = ? AND game_id = ?`, [summoner.dbId, toGameId(matchList[i])]);
            if (result.length == 0) {
                const match = yield getMatch(matchList[i], summoner.name);
                if (match) {
                    const part = match.getParticipant(summoner.name);
                    if (part) {
                        yield connection_1.default.runQuery(`INSERT INTO deaths_data (game_id,summoner_id,champion_id,deaths) VALUES (?)`, [[match.gameId, summoner.dbId, part.championId, part.deaths]]);
                    }
                }
            }
        }
    });
}
function toGameId(matchId) {
    if (!matchId.substring) {
        return 0;
    }
    return parseInt(matchId.substring(4, matchId.length));
}
function getMatch(matchId, sn) {
    return __awaiter(this, void 0, void 0, function* () {
        const gameId = toGameId(matchId);
        if (gameId == 0) {
            return null;
        }
        for (let i in loadedMatchs) {
            if (loadedMatchs[i].gameId == gameId) {
                return loadedMatchs[i];
            }
        }
        const response = yield request(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${config_json_1.api_key}`);
        const match = new Match(response.info.gameId);
        const parts = response.info.participants;
        for (let i in parts) {
            if (containsSummoner(normalizeSpaces(parts[i].summonerName))) {
                match.addParticipant({ championId: parts[i].championId, deaths: parts[i].deaths, summonerName: normalizeSpaces(parts[i].summonerName) });
            }
        }
        loadedMatchs.push(match);
        return match;
    });
}
function containsSummoner(name) {
    for (let i in summoners) {
        if (summoners[i].name.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}
function getLastMatchs(puuid, count) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield request(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${config_json_1.api_key}`);
    });
}
function getCurrentGame(summonerId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield request(`https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${config_json_1.api_key}`);
    });
}
function loadSummoners() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield connection_1.default.runQuery("SELECT * FROM summoners");
        for (let i in result) {
            const name = result[i].summoner_name;
            const sis = yield getSummonerIds(name);
            summoners.push(new Summoner(name, result[i].discord_tag, result[i].id, sis, yield getGameDeathRank(result[i].id)));
        }
    });
}
function getSummonerIds(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${config_json_1.api_key}`);
        return { id: response.id, puuid: response.puuid, accountId: response.accountId };
    });
}
function normalizeSpaces(str) {
    while (str.startsWith(' ')) {
        str = str.substring(1, str.length);
    }
    while (str.endsWith(' ')) {
        str = str.substring(0, str.length - 1);
    }
    return str;
}
function request(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (requestEndDate && (0, utils_1.compareDates)(new Date(), requestEndDate) >= 0) {
            requestStartDate = null;
            console.log(`END: ${requestEndDate.toLocaleString()} NOW: ${new Date().toLocaleString()}`);
        }
        else if (requestEndDate && requestCounter >= 98) {
            requestStartDate = null;
            const waittime = (0, utils_1.timeBetweenDates)(requestEndDate, new Date());
            console.log(`ENDDATE: ${requestEndDate.toLocaleString()} NOW: ${new Date().toLocaleString()} WAITTIME:${waittime}`);
            yield (0, utils_1.sleep)(waittime);
            console.log(`CONTINUE: ${new Date().toLocaleString()}`);
        }
        try {
            const response = yield fetch(url);
            if (!requestStartDate) {
                requestStartDate = new Date();
                requestEndDate = new Date(requestStartDate.getTime() + (2 * 60 * 1000));
                requestCounter = 0;
            }
            requestCounter++;
            yield (0, utils_1.sleep)(51);
            return yield response.json();
        }
        catch (err) {
            console.log(err);
        }
        return null;
    });
}
//# sourceMappingURL=app.js.map