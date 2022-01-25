import connection from "./connection";
import { Client, Intents } from 'discord.js';
import { sleep, timeBetweenDates, compareDates } from "./utils";

const fetch = require('node-fetch');

const api_key = "RGAPI-836f78c3-82ed-4be6-aa83-5effc2156529";

const champions: Champion[] = [];
const loadedMatchs: Match[] = [];
const summoners: Summoner[] = [];

var requestCounter = 0;
var requestStartDate: any;
var requestEndDate: any;

var ranks: Rank[] = [];

var announces: string[] = [];



const client: any = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login("OTM1MDA1MzY4NTIwNjcxMjY0.Ye4Vmw.YPVgVUeNUlEQipgCP-iCQN1Stt8");

client.once('ready', () => {
    setInterval(() => {
        if (announces.length > 0) {
            client.channels.cache.get("850536066741698590").send(announces[0]);
            announces.splice(0, 1);
        }
    }, 200);
});

type Champion = {
    id: number,
    name: string
}
type ActualMatch = {
    announceState: "started" | "checking" | "finished";
    gameId: number;
    actualChampion: string;
    gameMode: string;
    queueId: number;
}

type SummonerIds = {
    id: string;
    puuid: string;
    accountId: string;
}

type Rank = {
    name: string;
    elements: {
        key: any;
        value: number;
    }[]
}

class Summoner {
    dbId: number;
    id: string;
    puuid: string;
    accountId: string;
    name: string;
    discordMention: string;
    actualMatch: ActualMatch | null = null;
    lastPlayed: Date | null = null;
    gameDeathRank: Rank;

    constructor(name: string, discordTag: string, dbId: number, summonerIds: SummonerIds, gameDeathRank: Rank) {
        this.name = name;
        this.discordMention = discordTag;
        this.dbId = dbId;
        this.id = summonerIds.id;
        this.puuid = summonerIds.puuid;
        this.accountId = summonerIds.accountId;
        this.gameDeathRank = gameDeathRank;
    }
}

type Participant = {
    summonerName: string;
    deaths: number;
    championId: number;
}

class Match {
    gameId: number;
    participants: Participant[] = [];

    constructor(matchId: number) {
        this.gameId = matchId;
    }

    addParticipant(participant: Participant) {
        this.participants.push(participant);
    }

    getParticipant(name: string) {
        for (let i in this.participants) {
            if (this.participants[i].summonerName.toLowerCase() == name.toLowerCase()) {
                return this.participants[i];
            }
        }
        return null;
    }
}

(async () => {
    await loadChampions();
    await loadSummoners();
    await loadAllRanks();
    const loop = async () => {
        try {
            for (let i in summoners) {
                await updateSummoner(summoners[i]);
                await checkAndSendAnnounces(summoners[i]);
            }
            loadedMatchs.length = 0;
        } catch (err) {
            console.log(err);
        }
        setTimeout(loop, 4000);
    }
    loop();
})();

function getChampionName(id: number) {
    for (let i in champions) {
        if (champions[i].id == id) {
            return champions[i].name;
        }
    }
    return "";
}

async function loadChampions() {
    let champs = await request("http://ddragon.leagueoflegends.com/cdn/12.2.1/data/en_US/champion.json");
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
}

async function updateSummoner(summoner: Summoner) {
    await updatePlaying(summoner);
    await updateDeaths(summoner);
}

async function checkAndSendAnnounces(summoner: Summoner) {
    await checkAndSendPlaying(summoner);
    await checkAndSendDeaths(summoner);
}

async function checkAndSendPlaying(summoner: Summoner) {
    if (summoner.actualMatch) {
        switch (summoner.actualMatch.announceState) {
            case "checking":
                summoner.actualMatch.announceState = "finished";
                if (summoner.lastPlayed) {
                    if (timeBetweenDates(new Date(), summoner.lastPlayed) < 20 * 60 * 1000) {//20 minutos
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
}

function getPlayingMessage(playing: Summoner[]) {
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
                        } else {
                            message += ", ";
                        }
                    }
                    message += `${sum.discordMention}(${sum.actualMatch.actualChampion})`;
                }
            }
            message += ` estão jogando um${queueName.length > 0 ? queueName : gameMode} nesse exato momento.`
        } else {
            const sum = playing[0];
            message = `${sum.discordMention} o FAMOSO, está jogando um${queueName.length > 0 ? queueName : gameMode} com esse champ lixo chamado ${am.actualChampion}.`
        }
    }
    return message;
}

function sendAnnouce(message: string) {
    announces.push(message);
}

async function checkAndSendDeaths(summoner: Summoner) {
    const ngdr = await getGameDeathRank(summoner.dbId);
    if (summoner.gameDeathRank.elements.length > 0 && ngdr.elements.length > 0) {
        const oldEls = summoner.gameDeathRank.elements;
        if (ngdr.elements[0].key == oldEls[0].key) {
            if (ngdr.elements[0].value != oldEls[0].value) {
                sendAnnouce(
                    `${summoner.discordMention} possui um novo recorde pessoal de mortes em uma única partida, liderando com ${getChampionName(ngdr.elements[0].key)}, morrendo ${ngdr.elements[0].value} vezes!`
                );
            }
        } else {
            sendAnnouce(
                `${summoner.discordMention} bateu o próprio recorde pessoal de mortes com ${getChampionName(ngdr.elements[0].key)}, morrendo ${ngdr.elements[0].value} em uma única partida!`
            );
        }
    }
    for (let i in ranks) {
        let newRank;
        switch (ranks[i].name) {
            case "totalDeathRank":
                newRank = await getTotalDeathRank();
                break;
            case "gameDeathRank":
                newRank = await getGameDeathRank();
                break;
            default:
                newRank = await getChampionDeathRank(parseInt(ranks[i].name));
                break;
        }
        if (ranks[i].elements.length > 0 && newRank.elements.length > 0) {
            const oel = ranks[i].elements[0];
            const nel = newRank.elements[0];
            switch (ranks[i].name) {
                case "gameDeathRank":
                    if (oel.key.dbId != nel.key.dbId) {
                        sendAnnouce(
                            `${nel.key.summoner.discordMention} ta dando show de ${nel.key.championName}, morreu ${nel.value} em uma única partida, tomando o 1º lugar dessa lixeira de ${oel.key.championName} que o indivíduo ${oel.key.summoner.discordMention} chama de campeão!`
                        );
                    }
                case "totalDeathRank":
                    if (oel.key.dbId != nel.key.dbId) {
                        sendAnnouce(
                            `${oel.key.discordMention} foi superado por ${nel.key.discordMention} tomando o 1º lugar no ranking geral de mortes com um total de ${nel.value} mortes!`
                        );
                    }
                    break;
                default:
                    if (oel.key.dbId != nel.key.dbId) {
                        sendAnnouce(
                            `${nel.key.discordMention} ta dando aula de como jogar com ${getChampionName(parseInt(ranks[i].name))}, morreu um total de ${nel.value} vezes tomando o 1º lugar de ${oel.key.discordMention} no ranking total de mortes com o campeão!`
                        );
                    }
                    break;
            }
        }
        ranks[i] = newRank;
    }
}

async function loadAllRanks() {
    for (let i in champions) {
        ranks.push(await getChampionDeathRank(champions[i].id));
    }
    ranks.push(await getGameDeathRank());
    ranks.push(await getTotalDeathRank());
}

function getSummonerBy(dbId: number) {
    for (let i in summoners) {
        if (summoners[i].dbId == dbId) {
            return summoners[i];
        }
    }
    return null;
}

async function getTotalDeathRank() {
    const result: any = await connection.runQuery("SELECT summoner_id,SUM(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5");
    const rank: Rank = {
        name: "totalDeathRank",
        elements: []
    }
    for (let i in result) {
        rank.elements.push({ key: getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] })
    }
    return rank;
}

async function getGameDeathRank(summonerDbId?: number) {
    const rank: Rank = {
        name: "gameDeathRank",
        elements: []
    }
    if (summonerDbId) {
        const result: any = await connection.runQuery(
            `SELECT champion_id,MAX(deaths) FROM deaths_data WHERE summoner_id = ${summonerDbId} GROUP BY game_id ORDER BY MAX(deaths) DESC LIMIT 0,5`
        );
        rank.name = "sGameDeathRank";
        for (let i in result) {
            rank.elements.push({ key: getChampionName(result[i]["champion_id"]), value: result[i]["MAX(deaths)"] })
        }
    } else {
        const result: any = connection.runQuery(
            "SELECT summoner_id,champion_id,MAX(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY MAX(deaths) DESC LIMIT 0,5"
        );

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
}

async function getChampionDeathRank(championId: number) {
    const result: any = await connection.runQuery(`SELECT summoner_id,SUM(deaths) FROM deaths_data WHERE champion_id = ${championId} GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5`);
    const rank: Rank = {
        name: championId + "",
        elements: []
    }
    for (let i in result) {
        rank.elements.push({ key: getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] })
    }
    return rank;
}

async function updatePlaying(summoner: Summoner) {
    const response = await getCurrentGame(summoner.id);
    if (response) {
        const { gameId, gameQueueConfigId, gameMode, participants } = response;
        if (gameMode) {
            if (!summoner.actualMatch) {
                summoner.actualMatch = getActualMatch(summoner, participants, gameMode, gameQueueConfigId, gameId);
            }
        } else {
            if (summoner.actualMatch) {
                summoner.actualMatch = null;
                summoner.lastPlayed = new Date();
            }
        }
    }
}

function getActualMatch(summoner: Summoner, participants: any[], gameMode: string, gameQueueConfigId: number, gameId: number): ActualMatch {
    let actualChampion = "";
    for (let i in participants) {
        if (participants[i].summonerName == summoner.name) {
            actualChampion = getChampionName(participants[i].championId);
            break;
        }
    }
    return { announceState: "started", gameId: gameId, actualChampion: actualChampion, gameMode: gameMode, queueId: gameQueueConfigId };
}

async function updateDeaths(summoner: Summoner) {
    const matchList = await getLastMatchs(summoner.puuid, 20);
    for (let i in matchList) {
        const result: any = await connection.runQuery(
            `SELECT id FROM deaths_data WHERE summoner_id = ? AND game_id = ?`,
            [summoner.dbId, toGameId(matchList[i])]
        );
        if (result.length == 0) {
            const match = await getMatch(matchList[i], summoner.name);
            if (match) {
                const part = match.getParticipant(summoner.name);
                if (part) {
                    await connection.runQuery(
                        `INSERT INTO deaths_data (game_id,summoner_id,champion_id,deaths) VALUES (?)`,
                        [[match.gameId, summoner.dbId, part.championId, part.deaths]]
                    );
                }
            }
        }
    }
}

function toGameId(matchId: string) {
    if (!matchId.substring) {
        return 0;
    }
    return parseInt(matchId.substring(4, matchId.length));
}

async function getMatch(matchId: string, sn: string) {
    const gameId = toGameId(matchId);
    if (gameId == 0) {
        return null;
    }
    for (let i in loadedMatchs) {
        if (loadedMatchs[i].gameId == gameId) {
            return loadedMatchs[i];
        }
    }
    const response = await request(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${api_key}`);
    const match = new Match(response.info.gameId);
    const parts = response.info.participants;
    for (let i in parts) {
        if (containsSummoner(normalizeSpaces(parts[i].summonerName))) {
            match.addParticipant({ championId: parts[i].championId, deaths: parts[i].deaths, summonerName: normalizeSpaces(parts[i].summonerName) });
        }
    }
    loadedMatchs.push(match);
    return match;
}

function containsSummoner(name: string) {
    for (let i in summoners) {
        if (summoners[i].name.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}

async function getLastMatchs(puuid: string, count: number) {
    return await request(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${api_key}`);
}

async function getCurrentGame(summonerId: string) {
    return await request(`https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${api_key}`);
}

async function loadSummoners() {
    const result: any = await connection.runQuery("SELECT * FROM summoners");
    for (let i in result) {
        const name = result[i].summoner_name;
        const sis = await getSummonerIds(name);
        summoners.push(new Summoner(name, result[i].discord_tag, result[i].id, sis, await getGameDeathRank(result[i].id)));
    }
}

async function getSummonerIds(name: string) {
    const response = await request(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${api_key}`);
    return { id: response.id, puuid: response.puuid, accountId: response.accountId };
}

function normalizeSpaces(str: string) {
    while (str.startsWith(' ')) {
        str = str.substring(1, str.length);
    }
    while (str.endsWith(' ')) {
        str = str.substring(0, str.length - 1);
    }
    return str;
}

async function request(url: string) {
    if (requestEndDate && compareDates(new Date(), requestEndDate) >= 0) {
        requestStartDate = null;
        console.log(`END: ${(requestEndDate as Date).toLocaleString()} NOW: ${new Date().toLocaleString()}`);
    } else if (requestEndDate && requestCounter >= 98) {
        requestStartDate = null;
        const waittime = timeBetweenDates(requestEndDate, new Date());
        console.log(`ENDDATE: ${(requestEndDate as Date).toLocaleString()} NOW: ${new Date().toLocaleString()} WAITTIME:${waittime}`);
        await sleep(waittime);
        console.log(`CONTINUE: ${new Date().toLocaleString()}`);
    }
    try {
        const response = await fetch(url);
        if (!requestStartDate) {
            requestStartDate = new Date();
            requestEndDate = new Date(requestStartDate.getTime() + (2 * 60 * 1000));
            requestCounter = 0;
        }
        requestCounter++;
        await sleep(51);
        return await response.json();
    } catch (err) {
        console.log(err);
    }
    return null;
}