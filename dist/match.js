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
const request_1 = require("./request");
const utils_1 = require("./utils");
const summoner_1 = require("./summoner");
const utils_2 = require("./utils");
const bot_1 = __importDefault(require("./bot"));
const loadedMatchs = [];
const currentGamesIds = [];
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
    static toGameId(matchId) {
        if (!matchId.substring) {
            return 0;
        }
        return parseInt(matchId.substring(4, matchId.length));
    }
    static getMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameId = Match.toGameId(matchId);
            if (gameId == 0) {
                return null;
            }
            for (let i in loadedMatchs) {
                if (loadedMatchs[i].gameId == gameId) {
                    return loadedMatchs[i];
                }
            }
            const response = yield (0, request_1.request)(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${request_1.api_key}`);
            const match = new Match(response.info.gameId);
            const parts = response.info.participants;
            for (let i in parts) {
                if ((0, summoner_1.containsSummoner)((0, utils_1.normalizeSpaces)(parts[i].summonerName))) {
                    match.addParticipant({ championId: parts[i].championId, deaths: parts[i].deaths, summonerName: (0, utils_1.normalizeSpaces)(parts[i].summonerName) });
                }
            }
            loadedMatchs.push(match);
            return match;
        });
    }
    static addCurrentMatch(gameId, gameMode, queueId) {
        var _a;
        for (let i in currentGamesIds) {
            if (currentGamesIds[i] == gameId) {
                return;
            }
        }
        currentGamesIds.push(gameId);
        const sums = (0, summoner_1.getSummoners)();
        const playing = [];
        for (let i in sums) {
            if (sums[i].actualMatch && ((_a = sums[i].actualMatch) === null || _a === void 0 ? void 0 : _a.gameId) == gameId) {
                playing.push(sums[i]);
            }
        }
        const now = new Date();
        for (let i in playing) {
            const sum = playing[i];
            if (!sum.lastPlayed || (0, utils_2.timeBetweenDates)(now, sum.lastPlayed) >= 20 * 60 * 1000) {
                if (playing.length == 1) {
                    bot_1.default.sendStartSoloPlaying(sum, getGameModeCustomName(gameMode), getQueueCustomName(queueId));
                }
                else {
                    bot_1.default.sendStartGroupPlaying(playing, getGameModeCustomName(gameMode), getQueueCustomName(queueId));
                }
                break;
            }
        }
    }
    static updateCurrentMatches() {
        const sums = (0, summoner_1.getSummoners)();
        const matchs = [...currentGamesIds];
        con: for (let i in matchs) {
            for (let j in sums) {
                const sum = sums[j];
                if (sum.actualMatch && sum.actualMatch.gameId == currentGamesIds[i]) {
                    continue con;
                }
            }
            this.removeCurrentMatch(matchs[i]);
        }
    }
    static removeCurrentMatch(gameId) {
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
function getQueueCustomName(queueId) {
    switch (queueId) {
        case 420:
            return "Rankedzinha";
        case 440:
            return "Flexzinha";
        default:
            return null;
    }
}
function getGameModeCustomName(gameMode) {
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
exports.default = Match;
//# sourceMappingURL=match.js.map