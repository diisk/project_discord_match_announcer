import { request } from "./request";

const champions: Champion[] = [];


class Champion {
    id: string;
    key: number;
    name: string;

    private constructor(champInfo: any) {
        this.id = champInfo.id;
        this.key = champInfo.key;
        this.name = champInfo.name;
    }

    static async loadChampions() {
        const champs = (await request("http://ddragon.leagueoflegends.com/cdn/12.2.1/data/en_US/champion.json")).data;
        for (let i in champs) {
            champions.push(new Champion(champs[i]));
        }
    }

    static getChampionBy(keyOrId: number | string) {
        if (typeof (keyOrId) == "string") {
            for (let i in champions) {
                if (champions[i].id == keyOrId) {
                    return champions[i];
                }
            }
        } else {
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

export default Champion;