import connection from "./connection";
import Bot from "./bot";
import Summoner, { getSummoners } from "./summoner";
import Rank from "./rank";
import Match from "./match";
import Champion from "./champion";


(async () => {
    await Champion.loadChampions();
    await Summoner.loadSummoners();
    await Rank.loadAllRanks();
    await Bot.initialize(); 
    const loop = async () => {
        try {
            await Summoner.updateAllSummoners();
            await Rank.updateRanks();
            Match.clearLoadedMatches();
        } catch (err) {
            console.log(err);
        }
        setTimeout(loop, 4000);
    }
    loop();
})();

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

