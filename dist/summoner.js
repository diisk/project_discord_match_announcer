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
exports.getSummoners = exports.containsSummoner = void 0;
const request_1 = require("./request");
const connection_1 = __importDefault(require("./connection"));
const utils_1 = require("./utils");
const match_1 = __importDefault(require("./match"));
const bot_1 = __importDefault(require("./bot"));
const summoners = [];
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
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updatePlaying();
            yield this.updateDeaths();
        });
    }
    updatePlaying() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.getCurrentGame();
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
                                };
                            }
                        }
                        match_1.default.addCurrentMatch(gameId, gameMode, gameQueueConfigId);
                    }
                }
                else {
                    if (this.actualMatch) {
                        this.actualMatch = null;
                        this.lastPlayed = new Date();
                    }
                }
            }
        });
    }
    updateDeaths() {
        return __awaiter(this, void 0, void 0, function* () {
            const matchList = yield this.getLastMatchs(20);
            for (let i in matchList) {
                const result = yield connection_1.default.runQuery(`SELECT id FROM deaths_data WHERE summoner_id = ? AND game_id = ?`, [this.dbId, match_1.default.toGameId(matchList[i])]);
                if (result.length == 0) {
                    const match = yield match_1.default.getMatch(matchList[i]);
                    if (match) {
                        const part = match.getParticipant(this.name);
                        if (part) {
                            yield connection_1.default.runQuery(`INSERT INTO deaths_data (game_id,summoner_id,champion_key,deaths) VALUES (?)`, [[match.gameId, this.dbId, part.championId, part.deaths]]);
                        }
                    }
                }
            }
            yield this.checkAndUpdateGDR();
        });
    }
    checkAndUpdateGDR() {
        return __awaiter(this, void 0, void 0, function* () {
            const ngdr = yield getGameDeathRank(this.dbId);
            if (this.gameDeathRank.elements.length > 0 && ngdr.elements.length > 0) {
                const oldEls = this.gameDeathRank.elements;
                if (ngdr.elements[0].key == oldEls[0].key) {
                    if (ngdr.elements[0].value != oldEls[0].value) {
                        bot_1.default.sendRankAnnounce(ngdr, `${this.discordMention} possui um novo recorde pessoal de mortes em uma única partida, liderando com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} vezes!`);
                    }
                }
                else {
                    bot_1.default.sendRankAnnounce(ngdr, `${this.discordMention} bateu o próprio recorde pessoal de mortes com ${ngdr.elements[0].key}, morrendo ${ngdr.elements[0].value} em uma única partida!`);
                }
            }
            this.gameDeathRank = ngdr;
        });
    }
    getCurrentGame() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, request_1.request)(`https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${this.id}?api_key=${request_1.api_key}`);
        });
    }
    getLastMatchs(count) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, request_1.request)(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${this.puuid}/ids?start=0&count=${count}&api_key=${request_1.api_key}`);
        });
    }
    static loadSummoners() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield connection_1.default.runQuery("SELECT * FROM summoners");
            for (let i in result) {
                const name = result[i].summoner_name;
                const sis = yield getSummonerIds(name);
                summoners.push(new Summoner(name, result[i].discord_tag, result[i].id, sis, yield getGameDeathRank(result[i].id)));
            }
        });
    }
    static updateAllSummoners() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i in summoners) {
                yield summoners[i].update();
            }
        });
    }
    static getSummonerBy(nameOrDbId) {
        if (typeof (nameOrDbId) == 'string') {
            for (let i in summoners) {
                if (summoners[i].name.toLowerCase() == (0, utils_1.normalizeSpaces)(nameOrDbId.toLowerCase())) {
                    return summoners[i];
                }
            }
        }
        else {
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
exports.getSummoners = getSummoners;
function containsSummoner(name) {
    for (let i in summoners) {
        if (summoners[i].name.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}
exports.containsSummoner = containsSummoner;
function getGameDeathRank(summonerDbId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rank = {
            name: "sGameDeathRank",
            elements: []
        };
        const result = yield connection_1.default.runQuery(`SELECT champion_key,MAX(deaths) FROM deaths_data WHERE summoner_id = ${summonerDbId} GROUP BY game_id ORDER BY MAX(deaths) DESC LIMIT 0,5`);
        rank.name = "sGameDeathRank";
        for (let i in result) {
            rank.elements.push({ key: parseInt(result[i]["champion_key"]), value: result[i]["MAX(deaths)"] });
        }
        return rank;
    });
}
function getSummonerIds(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, request_1.request)(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${request_1.api_key}`);
        return { id: response.id, puuid: response.puuid, accountId: response.accountId };
    });
}
exports.default = Summoner;
//# sourceMappingURL=summoner.js.map