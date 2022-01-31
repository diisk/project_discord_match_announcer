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
const bot_1 = __importDefault(require("./bot"));
const summoner_1 = __importDefault(require("./summoner"));
const rank_1 = __importDefault(require("./rank"));
const match_1 = __importDefault(require("./match"));
const champion_1 = __importDefault(require("./champion"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield bot_1.default.initialize();
    yield champion_1.default.loadChampions();
    yield summoner_1.default.loadSummoners();
    yield rank_1.default.loadAllRanks();
    const loop = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield summoner_1.default.updateAllSummoners();
            yield rank_1.default.updateRanks();
            match_1.default.clearLoadedMatches();
        }
        catch (err) {
            console.log(err);
        }
        setTimeout(loop, 4000);
    });
    loop();
}))();
/*function getPlayingMessage(playing: Summoner[]) {
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
}*/
//# sourceMappingURL=app.js.map