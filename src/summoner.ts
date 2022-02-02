import {Rank} from "./rank";
import { request, api_key } from "./request";
import connection from "./connection";
import Champion from "./champion";
import { normalizeSpaces } from "./utils";
import Match from "./match";
import Bot from "./bot";

const summoners: Summoner[] = [];

type ActualMatch = {
    gameId: number;
    championId: number;
}

type SummonerIds = {
    id: string;
    puuid: string;
    accountId: string;
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

    async update() {
        await this.updatePlaying();
        await this.updateDeaths();
    }

    private async updatePlaying() {
        const response = await this.getCurrentGame();
        if (response) {
            const { gameId, gameQueueConfigId, gameMode, participants } = response;
            if (gameMode) {
                if (!this.actualMatch) {
                    for (let i in participants) {
                        const sum = Summoner.getSummonerBy(participants[i].summonerName);
                        if (sum) {
                            sum.actualMatch = {
                                gameId: gameId,
                                championId: participants[i].championId,
                            }
                        }
                    }
                    Match.addCurrentMatch(gameId, gameMode, gameQueueConfigId);
                }
            } else {
                if (this.actualMatch) {
                    this.actualMatch = null;
                    this.lastPlayed = new Date();
                }
            }
        }
    }

    private async updateDeaths() {
        const matchList = await this.getLastMatchs(20);
        for (let i in matchList) {
            const result: any = await connection.runQuery(
                `SELECT id FROM deaths_data WHERE summoner_id = ? AND game_id = ?`,
                [this.dbId, Match.toGameId(matchList[i])]
            );
            if (result.length == 0) {
                const match = await Match.getMatch(matchList[i]);
                if (match) {
                    const part = match.getParticipant(this.name);
                    if (part) {
                        await connection.runQuery(
                            `INSERT INTO deaths_data (game_id,summoner_id,champion_key,deaths) VALUES (?)`,
                            [[match.gameId, this.dbId, part.championId, part.deaths]]
                        );
                    }
                }
            }
        }

        await this.checkAndUpdateGDR();
    }

    private async checkAndUpdateGDR(){
        const ngdr = await getGameDeathRank(this.dbId);
        if (this.gameDeathRank.elements.length > 0 && ngdr.elements.length > 0) {
            const oldEls = this.gameDeathRank.elements;
            if (ngdr.elements[0].key == oldEls[0].key) {
                if (ngdr.elements[0].value != oldEls[0].value) {
                    Bot.sendRankAnnounce(ngdr,
                        `${this.discordMention} possui um novo recorde pessoal de mortes em uma única partida, liderando com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} vezes!`
                        );
                }
            } else {
                Bot.sendRankAnnounce(ngdr,
                    `${this.discordMention} bateu o próprio recorde pessoal de mortes com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} em uma única partida!`
                    );
            }
        }
        this.gameDeathRank = ngdr;
    }

    private async getCurrentGame() {
        return await request(`https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${this.id}?api_key=${api_key}`);
    }

    private async getLastMatchs(count: number) {
        return await request(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${this.puuid}/ids?start=0&count=${count}&api_key=${api_key}`);
    }

    static async loadSummoners() {
        const result: any = await connection.runQuery("SELECT * FROM summoners");
        for (let i in result) {
            const name = result[i].summoner_name;
            const sis = await getSummonerIds(name);
            summoners.push(new Summoner(name, result[i].discord_tag, result[i].id, sis, await getGameDeathRank(result[i].id)));
        }
    }

    static async updateAllSummoners() {
        for (let i in summoners) {
            await summoners[i].update();
        }
    }

    static getSummonerBy(nameOrDbId: number | string) {
        if (typeof (nameOrDbId) == 'string') {
            for (let i in summoners) {
                if (summoners[i].name.toLowerCase() == normalizeSpaces(nameOrDbId.toLowerCase())) {
                    return summoners[i];
                }
            }
        } else {
            for (let i in summoners) {
                if (summoners[i].dbId == nameOrDbId) {
                    return summoners[i];
                }
            }
        }
        return null;
    }


}

function getSummoners() {
    return [...summoners];
}

function containsSummoner(name: string) {
    for (let i in summoners) {
        if (summoners[i].name.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}

async function getGameDeathRank(summonerDbId: number) {
    const rank: Rank = {
        name: "sGameDeathRank",
        elements: []
    }
    const result: any = await connection.runQuery(
        `SELECT champion_key,MAX(deaths) FROM deaths_data WHERE summoner_id = ${summonerDbId} GROUP BY game_id ORDER BY MAX(deaths) DESC LIMIT 0,5`
    );
    rank.name = "sGameDeathRank";
    for (let i in result) {
        rank.elements.push({ key: parseInt(result[i]["champion_key"]), value: result[i]["MAX(deaths)"] })
    }
    return rank;
}

async function getSummonerIds(name: string) {
    const response = await request(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${api_key}`);
    return { id: response.id, puuid: response.puuid, accountId: response.accountId };
}


export {
    containsSummoner,
    getSummoners
}
export default Summoner;