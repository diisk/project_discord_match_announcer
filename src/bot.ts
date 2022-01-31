import { Client, EmbedFieldData, Intents, MessageEmbed } from 'discord.js';
import Champion from './champion';
import {
	discord_token,
	channelId,
	karthusImageURL,
	deathImageURL,
	defeatImageURL,
	amumuImageURL,
	unicaImageURL,
	totalImageURL,
	pessoalImageURL
} from "./config.json";
import { Rank } from './rank';
import Summoner from './summoner';



var client: any;

var announces:MessageEmbed[] = [];

const exampleEmbed = new MessageEmbed()
	.setColor('#b11616')
	.setTitle('MiB DiisK')
	.setAuthor({ name: 'Deathspectator', iconURL: karthusImageURL })
	.setDescription('Some description here')
	.setThumbnail(deathImageURL)
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: false },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addField('Inline field title', 'Some value here', true)
	//.setImage(deathImageURL)
	.setTimestamp()
//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

class Bot {

	static sendRankAnnounce(rank:Rank,oldSummoner:Summoner,newSummoner:Summoner){
		const {title,description,thumbURL,fields} = getRankData(rank);
		const embed = new MessageEmbed()
			.setColor('#000000')
			.setTitle(title)
			.setAuthor({ name: 'Deathspectator', iconURL: karthusImageURL })
			.setDescription(description)
			.addFields(fields)
			.addField("Obs:",`${newSummoner.discordMention} acabou de superar ${oldSummoner.discordMention} tomando seu 1º lugar no ranking.`)
			.setTimestamp()
			if(thumbURL){
				embed.setThumbnail(thumbURL);
			}
		announces.push(embed);
	}

	static sendStartSoloPlaying(summoner: Summoner, gameMode: string, queueName: string | null) {
		let championName:any = "error";
		if(summoner.actualMatch){
			championName = Champion.getChampionBy(summoner.actualMatch.championId);
			if(championName){
				championName = championName.name;
			}else{
				championName = "error";
			}
		}
		const embed = new MessageEmbed()
			.setColor('#02de7f')
			.setThumbnail(amumuImageURL)
			.setTitle(`Jogando ${(queueName?queueName:gameMode).toLowerCase()} solo`)
			.setAuthor({ name: 'Deathspectator', iconURL: karthusImageURL })
			.setDescription(summoner.discordMention)
			.addField("Campeão",championName)
			.setTimestamp()
		announces.push(embed);
	}

	static sendStartGroupPlaying(summoners: Summoner[], gameMode: string, queueName: string | null) {
		const fields:any = [];
		for(let i=0;i<summoners.length;i++){
			const sum = summoners[i];
			let championName = "error"
			if(sum.actualMatch){
				const champ = Champion.getChampionBy(sum.actualMatch.championId);
				if(champ){
					championName = champ.name;
				}
			}
			if(i==0){
				fields.push({ name: 'Nick', value: sum.name, inline: true });
				fields.push({ name: 'Campeão', value: championName, inline: true });
				fields.push({ name: 'Discord', value: sum.discordMention, inline:true });
			}else{
				fields.push({ name: '\u200B', value: sum.name, inline: true });
				fields.push({ name: '\u200B', value: championName, inline: true });
				fields.push({ name: '\u200B', value: sum.discordMention, inline:true });
			}
		}
		const embed = new MessageEmbed()
			.setColor('#b11616')
			.setTitle(`${queueName?queueName:gameMode} com os parças`)
			.setAuthor({ name: 'Deathspectator', iconURL: karthusImageURL })
			.setDescription(`Estão jogando agora:`)
			.addFields(fields)
			.setImage(defeatImageURL)
			.setTimestamp()
		announces.push(embed);
	}

	static initialize() {
		client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
		client.login(discord_token);

		client.on('messageCreate', (message: any) => {
			//TRATAR AS MSGS
		});

		client.once('ready', () => {
			setInterval(() => {
				if (announces.length > 0) {
					const embed = announces[0];
					announces.splice(0,1);
					client.channels.cache.get(channelId).send({ embeds: [embed] });
				}
			}, 200);
		});
	}

}

function getRankData(rank:Rank){
	let rankData:any;
	switch (rank.name) {
		case "gameDeathRank":
			rankData = {
				title:"Top 5 (Geral)",
				description:"Mortes em uma única partida.",
				thumbURL:unicaImageURL,
				fields:[]
			};
			for(let i=0;i<rank.elements.length;i++){
				let championName:any = Champion.getChampionBy(rank.elements[i].key.championKey);
				if(championName){
					championName = championName.name;
				}else{
					championName = "error";
				}
				if(i==0){
					rankData.fields.push({name:"Pos/Nick",value:`1. ${rank.elements[i].key.summoner.name}`,inline:true});
					rankData.fields.push({name:"Campeão",value:championName,inline:true});
					rankData.fields.push({name:"Mortes",value:rank.elements[i].value,inline:true});
				}else{
					rankData.fields.push({name:"\u200B",value:`${i+1}. ${rank.elements[i].key.summoner.name}`,inline:true});
					rankData.fields.push({name:"\u200B",value:championName,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].value,inline:true});
				}
			}
			break;
		case "sGameDeathRank":
			rankData = {
				title:"Top 5 (Pessoal)",
				description:"Mortes em uma única partida.",
				thumbURL:pessoalImageURL,
				fields:[]
			};
			for(let i=0;i<rank.elements.length;i++){
				let championName:any = Champion.getChampionBy(rank.elements[i].key);
				if(championName){
					championName = championName.name;
				}else{
					championName = "error";
				}
				if(i==0){
					rankData.fields.push({name:"Posição",value:'1.',inline:true});
					rankData.fields.push({name:"Campeão",value:championName,inline:true});
					rankData.fields.push({name:"Mortes",value:rank.elements[i].value,inline:true});
				}else{
					rankData.fields.push({name:"\u200B",value:`${i+1}.`,inline:true});
					rankData.fields.push({name:"\u200B",value:championName,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].value,inline:true});
				}
			}
			break;
		case "totalDeathRank":
			rankData = {
				title:"Top 5 (Geral)",
				description:"Mortes no total.",
				thumbURL:totalImageURL,
				fields:[]
			};
			for(let i=0;i<rank.elements.length;i++){
				if(i==0){
					rankData.fields.push({name:"Posição",value:'1.',inline:true});
					rankData.fields.push({name:"Nick",value:rank.elements[i].key.name,inline:true});
					rankData.fields.push({name:"Mortes",value:rank.elements[i].value,inline:true});
				}else{
					rankData.fields.push({name:"\u200B",value:`${i+1}.`,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].key.name,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].value,inline:true});
				}
			}
			break;
		default:
			let champ:any = Champion.getChampionBy(rank.name);
			let champId:any = null;
			if(champ){
				champId = champ.id;
				champ = champ.name;
			}else{
				champ = "error";
			}
			rankData = {
				title:"Top 5 (Geral)",
				description:`Total de mortes com o ${champ}.`,
				thumbURL:getChampionImageURL(champId),
				fields:[]
			};
			for(let i=0;i<rank.elements.length;i++){
				if(i==0){
					rankData.fields.push({name:"Posição",value:'1.',inline:true});
					rankData.fields.push({name:"Nick",value:rank.elements[i].key.name,inline:true});
					rankData.fields.push({name:"Mortes",value:rank.elements[i].value,inline:true});
				}else{
					rankData.fields.push({name:"\u200B",value:`${i+1}.`,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].key.name,inline:true});
					rankData.fields.push({name:"\u200B",value:rank.elements[i].value,inline:true});
				}
			}
			break;
	}

	return rankData;
}

function getChampionImageURL(championId: string|null) {
	if(championId){
		return `https://blitz-cdn.blitz.gg/blitz/lol/champion/${championId}.webp`;
	}
    return null;
}

export default Bot;