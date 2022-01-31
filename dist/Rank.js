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
const champion_1 = __importDefault(require("./champion"));
const connection_1 = __importDefault(require("./connection"));
const summoner_1 = __importDefault(require("./summoner"));
var ranks = [];
function loadAllRanks() {
    return __awaiter(this, void 0, void 0, function* () {
        const champions = champion_1.default.getChampions();
        for (let i in champions) {
            ranks.push(yield getChampionDeathRank(champions[i].id));
        }
        ranks.push(yield getGameDeathRank());
        ranks.push(yield getTotalDeathRank());
    });
}
function updateRanks() {
    return __awaiter(this, void 0, void 0, function* () {
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
                    newRank = yield getChampionDeathRank(ranks[i].name);
                    break;
            }
            if (ranks[i].elements.length > 0 && newRank.elements.length > 0) {
                const oel = ranks[i].elements[0];
                const nel = newRank.elements[0];
                switch (ranks[i].name) {
                    case "gameDeathRank":
                        if (oel.key.dbId != nel.key.dbId) {
                            /*Bot.sendAnnounce(
                                `${nel.key.summoner.discordMention} ta dando show de ${nel.key.championName}, morreu ${nel.value} em uma única partida, tomando o 1º lugar dessa lixeira de ${oel.key.championName} que o indivíduo ${oel.key.summoner.discordMention} chama de campeão!`
                            );*/
                        }
                    case "totalDeathRank":
                        if (oel.key.dbId != nel.key.dbId) {
                            /*Bot.sendAnnounce(
                                `${oel.key.discordMention} foi superado por ${nel.key.discordMention} tomando o 1º lugar no ranking geral de mortes com um total de ${nel.value} mortes!`
                            );*/
                        }
                        break;
                    default:
                        if (oel.key.dbId != nel.key.dbId) {
                            /*Bot.sendAnnounce(
                                `${nel.key.discordMention} ta dando aula de como jogar com ${getChampionName(parseInt(ranks[i].name))}, morreu um total de ${nel.value} vezes tomando o 1º lugar de ${oel.key.discordMention} no ranking total de mortes com o campeão!`
                            );*/
                        }
                        break;
                }
            }
            ranks[i] = newRank;
        }
    });
}
function getTotalDeathRank() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield connection_1.default.runQuery("SELECT summoner_id,SUM(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5");
        const rank = {
            name: "totalDeathRank",
            elements: []
        };
        for (let i in result) {
            rank.elements.push({ key: summoner_1.default.getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] });
        }
        return rank;
    });
}
function getGameDeathRank() {
    return __awaiter(this, void 0, void 0, function* () {
        const rank = {
            name: "gameDeathRank",
            elements: []
        };
        const result = connection_1.default.runQuery("SELECT summoner_id,champion_key,MAX(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY MAX(deaths) DESC LIMIT 0,5");
        for (let i in result) {
            rank.elements.push({
                key: {
                    summoner: summoner_1.default.getSummonerBy(result[i]["summoner_id"]),
                    championKey: parseInt(result[i]["champion_key"])
                },
                value: result[i]["MAX(deaths)"]
            });
        }
        return rank;
    });
}
function getChampionDeathRank(championId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rank = {
            name: championId,
            elements: []
        };
        const champ = champion_1.default.getChampionBy(championId);
        if (champ) {
            const result = yield connection_1.default.runQuery(`SELECT summoner_id,SUM(deaths) FROM deaths_data WHERE champion_key = ${champ.key} GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5`);
            for (let i in result) {
                rank.elements.push({ key: summoner_1.default.getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] });
            }
        }
        return rank;
    });
}
exports.default = { updateRanks, loadAllRanks };
//# sourceMappingURL=rank.js.map