import { GuildMember } from "discord.js";
import { Model } from "mongoose";

// ------Club----
export class Club {
    tag: string;
    name: string;
    description: string;
    type: string;
    badgeId: number;
    requiredTrophies: number;
    trophies: number;
    start: number;
    members: Array<ClubMember>;
    status: number;
}
interface ClubMember {
    tag: string;
    name: string;
    nameColor: string;
    role: string;
    trophies: number;
    icon: IconObject;
}
interface IconObject {
    id: number;
}

// -------Player-----
export class Player {
    tag: string;
    name: string;
    nameColor: string;
    icon: IconObject;
    trophies: number;
    highestTrophies: number;
    highestPowerPlayPoints: number;
    expLevel: number;
    expPoints: number;
    isQualifiedFromChampionshipChallenge: boolean;
    '3vs3Victories': number;
    soloVictories: number;
    duoVictories: number;
    bestRoboRumbleTime: number;
    bestTimeAsBigBrawler: number;
    club: object;
    status: number;
    brawlers: Array<Brawler>;
}
interface PlayerClub {
    tag: string;
    name: string;
}
interface Brawler {
    id: number;
    name: string;
    power: number;
    rank: number;
    trophies: number;
    highestTrophies: number;
    starPowers: Array<StarPower>;
    gadgets: Array<Gadget>;
}
interface StarPower {
    id: number;
    name: string;
}
interface Gadget {
    id: number;
    name: string;
}

// ----------------------------- Mognoose player -----------------------------
export class MongoosePlayer extends Model {
    id: string;
	tag: string;
	name: string;
	icon: IconObject;
	trophies: Number;
	role: string;
	lastnames: Array<string>;
	club: PlayerClub;
	ladder: LadderObject;
	verification: VerificationObject;
	verified: Boolean;
	player: Player;
}

interface VerificationObject {
    at: Number;
    by: string;
    in: InObject;
    url: URL;
}
interface InObject {
    guildID: string;
    channelID: string;
}
interface LadderObject {
    [guildID: string]:  Boolean;
}

export class MongooseClub extends Model {
    id: string;
	tag: string;
	separator: string;
	prefix: string;
	type: string;
	region: string;
	verified: Boolean;	
	subregion: string;
	invite: string;
	hubserver: string;
	subregions: Array<SubRegion>;
	feeders: Array<string>;
	clubs: Array<Clubs>;
	blacklist: Array<string>;
	logs: Array<Logs>;
	club: Club;
	channels: Channels;
	roles: Roles;
	members: Members;
	messages: Object;
}
interface SubRegion {
    id: string;
    role: string;
}
interface Clubs {
    tag: string;
    role: string;
    subregion: string;
}
interface Logs {
    at: Number;
    by: string;
    change: string;
}
interface Channels {
    verification: Array<string>;
    auditlog: string;
    bandodger: string;
    embed: string;
    clublog: string;
    colorrole: string;
    selfassignablerole: string;
}
interface Roles {
    unverified: Array<string>;
    subregionroles: Array<Subregionroles>;
    regionroles: Array<string>;
    general: Array<string>;
    relicsmember: Array<string>;
    guest: Array<string>;
    vbp: Array<string>;
    nncp: Array<string>;
    vp: Array<string>;
    senior: Array<string>;
    events: Array<string>;
}
interface Subregionroles {
    id: string;
    role: string;
}
interface Members {
    verificationteam: Array<string>;
    managers: Array<string>;
}
interface Messages {
    noticemessage: string;
    entrymessage: string;
    welcomemessage: string;
}
export class MongooseClient extends Model {
    id: string;
    settings: MongooseSettings;
}
interface MongooseSettings {
    clubs: Array<string>;
    globalClubs: Array<string>;
    sendLogs: boolean;
    blacklist: Array<string>;
    baseURL: string;
    logs: Array<string>;
    blacklistedClubs: Array<string>;
}

export class VerificationResponse {
        verified: boolean;
        reason: string;
        changedNick: string;
        doc: MongooseClub;
        member: GuildMember
        roles: {
            notExistedRoles: string[],
            managedRoles: string[],
            nonManageableRoles: string[],
        }; 
        nickname: {
            changed: boolean,
            reason: string,
        };
}