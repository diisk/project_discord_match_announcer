import { request, api_key } from "./request";
import { normalizeSpaces } from "./utils";
import Summoner, { containsSummoner, getSummoners } from "./summoner";
import { timeBetweenDates } from "./utils";
import Bot from "./bot";


type Participant = {
    summonerName: string;
    deaths: number;
    championId: number;
}

const loadedMatchs: Match[] = [];

const currentGamesIds: number[] = [];

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

    static toGameId(matchId: string) {
        if (!matchId.substring) {
            return 0;
        }
        return parseInt(matchId.substring(4, matchId.length));
    }

    static async getMatch(matchId: string) {
        const gameId = Match.toGameId(matchId);
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

    static addCurrentMatch(gameId: number, gameMode: string, queueId: number) {
        for (let i in currentGamesIds) {
            if (currentGamesIds[i] == gameId) {
                return;
            }
        }
        currentGamesIds.push(gameId);

        const sums = getSummoners();
        const playing: Summoner[] = [];
        for (let i in sums) {
            if (sums[i].actualMatch && sums[i].actualMatch?.gameId == gameId) {
                playing.push(sums[i]);
            }
        }
        const now = new Date();
        for (let i in playing) {
            const sum = playing[i];
            if (!sum.lastPlayed || timeBetweenDates(now, sum.lastPlayed) >= 20 * 60 * 1000) {
                if (playing.length == 1) {
                    Bot.sendStartSoloPlaying(sum,getGameModeCustomName(gameMode),getQueueCustomName(queueId));
                } else {
                    Bot.sendStartGroupPlaying(playing,getGameModeCustomName(gameMode),getQueueCustomName(queueId));
                }
                break;
            }
        }
    }

    static updateCurrentMatches() {
        const sums = getSummoners();
        const matchs = [...currentGamesIds];
        con:
        for (let i in matchs) {
            for (let j in sums) {
                const sum = sums[j];
                if (sum.actualMatch && sum.actualMatch.gameId == currentGamesIds[i]) {
                    continue con;
                }
            }
            this.removeCurrentMatch(matchs[i]);
        }
    }

    private static removeCurrentMatch(gameId: number) {
        for (let i = 0; i < currentGamesIds.length; i++) {
            if (currentGamesIds[i] == gameId) {
                currentGamesIds.splice(i, 1);
                return;
            }
        }
    }

    static clearLoadedMatches() {
        loadedMatchs.length = 0;
    }
}

function getQueueCustomName(queueId:number){
    switch (queueId) {
        case 420:
            return "Rankedzinha";
        case 440:
            return "Flexzinha";
        default:
            return null;
    }
}

function getGameModeCustomName(gameMode: string) {
    switch (gameMode.toLowerCase()) {
        case "aram":
            return "Aranzinho";
        case "classic":
            return "Normalzinha";
        case "odyssey":
            return "Odisseyazinha G O D";
        case "kingporo":
            return "Kingporo";
        case "urf":
            return "URFzin Tryhard";
        default:
            return "Modo lixo";
    }
}

export default Match;