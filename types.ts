// FIX: Removed self-import of 'Language' type which conflicted with its local declaration.
export type Language = 'en' | 'pt';

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '16:9',
  WIDE = '21:9',
  TALL = '9:16',
}

export type CreatureType = 'enemy' | 'player' | 'ally' | 'npc';

// --- NPC Generator Specific Types ---

export type NpcType = 'ally' | 'neutral' | 'enemy';
export type NpcGender = 'male' | 'female' | 'any';

// Based on the D&D 5e statblock format from user's example
export interface StatBlock {
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  ac: number;
  hp: number;
  hit_dice: string;
  speed: string;
  stats: [number, number, number, number, number, number]; // STR, DEX, CON, INT, WIS, CHA
  proficiencyBonus: string;
  saves?: Array<{ name: string; value: number }>;
  skillsaves?: Array<{ name: string; value: number }>;
  damage_vulnerabilities?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  condition_immunities?: string;
  senses: string;
  languages: string;
  cr?: string;
  characterLevel?: number;
  traits: Array<[string, string]>;
  actions: Array<[string, string]>;
  reactions?: Array<[string, string]>;
  legendary_actions?: Array<[string, string]>;
  spells?: string[];
}

// Holds all generated textual data for an NPC
export interface GeneratedNpc {
  name: string;
  npcType: NpcType;
  race: string;
  class: string;
  gender: string;
  age: string;
  description: string;
  personality: string;
  belongings: string;
  statBlock: StatBlock;
  scenery: string; // Description of the portrait's background for the miniature base
}

// The final package returned by the service, including all images
export interface GeneratedNpcPackage {
  npcData: GeneratedNpc;
  portraitUrl: string;
  miniatureUrl: string;
  tokenUrl: string;
}