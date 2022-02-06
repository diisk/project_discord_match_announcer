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
function getStats(summonerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getStatsData(summonerId);
        const { topDeathsChampion, mostPlayedChampion, topDeathsGame } = data;
        const perGameDeathAverage = parseInt("" + (data.totalDeaths / data.totalGames));
        const generalPerGameDeathAverage = parseInt("" + (data.generalTotalDeaths / data.generalTotalGames));
        const tdcPerGameDeathAverage = parseInt("" + (topDeathsChampion.totalDeaths / topDeathsChampion.totalGames));
        const mpcPerGameDeathAverage = parseInt("" + (mostPlayedChampion.totalDeaths / mostPlayedChampion.totalGames));
        const ret = {
            totalDeathsPos: data.totalDeathsPos,
            totalDeaths: data.totalDeaths,
            totalDeathsDif: data.totalDeaths - data.generalTotalDeathsAverage,
            perGameDeathAverage: perGameDeathAverage,
            perGameDeathAverageDif: getPercentDifValue(perGameDeathAverage, generalPerGameDeathAverage),
            topDeathsChampion: {
                key: topDeathsChampion.key,
                totalDeathsPos: topDeathsChampion.totalDeathsPos,
                totalDeaths: topDeathsChampion.totalDeaths,
                perGameDeathAverage: tdcPerGameDeathAverage,
                perGameDeathAverageDif: getPercentDifValue(tdcPerGameDeathAverage, generalPerGameDeathAverage),
            },
            mostPlayedChampion: {
                key: mostPlayedChampion.key,
                totalDeathsPos: mostPlayedChampion.totalDeathsPos,
                totalDeaths: mostPlayedChampion.totalDeaths,
                perGameDeathAverage: mpcPerGameDeathAverage,
                perGameDeathAverageDif: getPercentDifValue(mpcPerGameDeathAverage, generalPerGameDeathAverage),
            },
            topDeathsGame: {
                champion_key: topDeathsGame.champion_key,
                totalDeathsPos: topDeathsGame.totalDeathsPos,
                totalDeaths: topDeathsGame.totalDeaths,
                perGameDeathAverageDif: getPercentDifValue(topDeathsGame.totalDeaths, generalPerGameDeathAverage)
            }
        };
        return ret;
    });
}
function getStatsData(summonerId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield connection_1.default.runQuery(`SELECT summoner_id,SUM(deaths),COUNT(game_id) FROM deaths_data GROUP BY summoner_id ORDER BY SUM(deaths) DESC`);
        const ret = {
            totalDeathsPos: 0,
            totalDeaths: 0,
            totalGames: 0,
            generalTotalDeaths: 0,
            generalTotalDeathsAverage: 0,
            generalTotalGames: 0,
            topDeathsChampion: {
                key: -1,
                totalDeaths: 0,
                totalDeathsPos: 0,
                totalGames: 0
            },
            mostPlayedChampion: {
                key: -1,
                totalDeaths: 0,
                totalDeathsPos: 0,
                totalGames: 0
            },
            topDeathsGame: {
                champion_key: 0,
                totalDeaths: 0,
                totalDeathsPos: 0
            }
        };
        for (let i = 0; i < result.length; i++) {
            if (result[i]["summoner_id"] == summonerId) {
                ret.totalDeathsPos = i + 1;
                ret.totalDeaths = result[i]["SUM(deaths)"];
                ret.totalGames = result[i]["COUNT(game_id)"];
            }
            ret.generalTotalDeaths += result[i]["SUM(deaths)"];
            ret.generalTotalGames += result[i]["COUNT(game_id)"];
        }
        ret.generalTotalDeathsAverage = parseInt("" + (ret.generalTotalDeaths / result.length));
        result = yield connection_1.default.runQuery(`SELECT summoner_id,champion_key,SUM(deaths),COUNT(game_id) FROM deaths_data GROUP BY champion_key,summoner_id ORDER BY SUM(deaths) DESC`);
        for (let i = 0; i < result.length; i++) {
            if (result[i]["summoner_id"] == summonerId) {
                if (ret.topDeathsChampion.key == -1) {
                    ret.topDeathsChampion.key = result[i]["champion_key"];
                    ret.topDeathsChampion.totalDeaths = result[i]["SUM(deaths)"];
                    ret.topDeathsChampion.totalDeathsPos = i + 1;
                    ret.topDeathsChampion.totalGames = result[i]["COUNT(game_id)"];
                }
                if (ret.mostPlayedChampion.key != -1) {
                    if (ret.mostPlayedChampion.totalGames <= result[i]["COUNT(game_id)"]) {
                        ret.mostPlayedChampion.key = result[i]["champion_key"];
                        ret.mostPlayedChampion.totalDeaths = result[i]["SUM(deaths)"];
                        ret.mostPlayedChampion.totalDeathsPos = i + 1;
                        ret.mostPlayedChampion.totalGames = result[i]["COUNT(game_id)"];
                    }
                }
                else {
                    ret.mostPlayedChampion.key = result[i]["champion_key"];
                    ret.mostPlayedChampion.totalDeaths = result[i]["SUM(deaths)"];
                    ret.mostPlayedChampion.totalDeathsPos = i + 1;
                    ret.mostPlayedChampion.totalGames = result[i]["COUNT(game_id)"];
                }
            }
        }
        result = yield connection_1.default.runQuery(`SELECT summoner_id,champion_key,SUM(deaths) FROM deaths_data GROUP BY game_id,summoner_id ORDER BY SUM(deaths) DESC`);
        for (let i = 0; i < result.length; i++) {
            if (result[i]["summoner_id"] == summonerId) {
                ret.topDeathsGame.champion_key = result[i]["champion_key"];
                ret.topDeathsGame.totalDeaths = result[i]["SUM(deaths)"];
                ret.topDeathsGame.totalDeathsPos = i + 1;
                break;
            }
        }
        return ret;
    });
}
function getPercentDifValue(value, average) {
    let mod = value / average;
    if (value > average) {
        mod = mod - 1;
    }
    else if (value < average) {
        mod = (1 - mod) * -1;
    }
    else {
        mod = 0;
    }
    return parseInt("" + (mod * 100));
    ;
}
exports.default = { getStats };
//# sourceMappingURL=stats.js.map