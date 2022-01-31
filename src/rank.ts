import Champion from "./champion";
import connection from "./connection";
import Summoner from "./summoner";

var ranks: Rank[] = [];

export type Rank = {
    name: string;
    elements: {
        key: any;
        value: number;
    }[]
}

async function loadAllRanks() {
    const champions = Champion.getChampions();
    for (let i in champions) {
        ranks.push(await getChampionDeathRank(champions[i].id));
    }
    ranks.push(await getGameDeathRank());
    ranks.push(await getTotalDeathRank());
}

async function updateRanks() {
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
                newRank = await getChampionDeathRank(ranks[i].name);
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
}

async function getTotalDeathRank() {
    const result: any = await connection.runQuery("SELECT summoner_id,SUM(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5");
    const rank: Rank = {
        name: "totalDeathRank",
        elements: []
    }
    for (let i in result) {
        rank.elements.push({ key: Summoner.getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] })
    }
    return rank;
}

async function getGameDeathRank() {
    const rank: Rank = {
        name: "gameDeathRank",
        elements: []
    }
    const result: any = connection.runQuery(
        "SELECT summoner_id,champion_key,MAX(deaths) FROM deaths_data GROUP BY summoner_id ORDER BY MAX(deaths) DESC LIMIT 0,5"
    );

    for (let i in result) {
        rank.elements.push({
            key: {
                summoner: Summoner.getSummonerBy(result[i]["summoner_id"]),
                championKey: parseInt(result[i]["champion_key"])
            },
            value: result[i]["MAX(deaths)"]
        });
    }
    return rank;
}

async function getChampionDeathRank(championId:string) {
    const rank: Rank = {
        name: championId,
        elements: []
    }
    const champ = Champion.getChampionBy(championId);
    if(champ){
        const result: any = await connection.runQuery(`SELECT summoner_id,SUM(deaths) FROM deaths_data WHERE champion_key = ${champ.key} GROUP BY summoner_id ORDER BY SUM(deaths) DESC LIMIT 0,5`);
        for (let i in result) {
            rank.elements.push({ key: Summoner.getSummonerBy(result[i]["summoner_id"]), value: result[i]["SUM(deaths)"] })
        }
    }
    return rank;
}

export default {updateRanks,loadAllRanks};