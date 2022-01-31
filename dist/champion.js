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
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const champions = [];
class Champion {
    constructor(champInfo) {
        this.id = champInfo.id;
        this.key = champInfo.key;
        this.name = champInfo.name;
    }
    static loadChampions() {
        return __awaiter(this, void 0, void 0, function* () {
            const champs = (yield (0, request_1.request)("http://ddragon.leagueoflegends.com/cdn/12.2.1/data/en_US/champion.json")).data;
            for (let i in champs) {
                champions.push(new Champion(champs[i]));
            }
        });
    }
    static getChampionBy(keyOrId) {
        if (typeof (keyOrId) == "string") {
            for (let i in champions) {
                if (champions[i].id == keyOrId) {
                    return champions[i];
                }
            }
        }
        else {
            for (let i in champions) {
                if (champions[i].key == keyOrId) {
                    return champions[i];
                }
            }
        }
        return null;
    }
    static getChampions() {
        return [...champions];
    }
}
exports.default = Champion;
//# sourceMappingURL=champion.js.map