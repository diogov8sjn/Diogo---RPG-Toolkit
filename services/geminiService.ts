import { GoogleGenAI, Type, Modality } from '@google/genai';
import { translations } from '../locales';
import { AspectRatio, CreatureType, Language, NpcType, NpcGender, GeneratedNpcPackage, GeneratedNpc } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set. The app will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTranslation = (lang: Language, key: string, replacements: { [key: string]: any } = {}) => {
  const keys = key.split('.');
  let text = translations[lang] as any;
  try {
    for (const k of keys) {
      text = text[k];
    }
    if (typeof text !== 'string') {
      return text || key;
    }
    return Object.entries(replacements).reduce(
      (acc, [placeholder, value]) => acc.replace(`{${placeholder}}`, String(value)),
      text
    );
  } catch (e) {
    return key;
  }
};

export const generateMiniatureAndToken = async (
  creatureName: string,
  imageBase64: string,
  mimeType: string,
  creatureType: CreatureType,
  scenery: string,
  language: Language
): Promise<{ miniature: string; token: string }> => {
  const miniaturePrompt = getTranslation(language, 'prompts.miniature', { creatureName, creatureType, scenery });
  const tokenPrompt = getTranslation(language, 'prompts.token', { creatureName, creatureType });

  const model = 'gemini-2.5-flash-image';
  const config = { responseModalities: [Modality.IMAGE] };

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const [miniatureResponse, tokenResponse] = await Promise.all([
    ai.models.generateContent({ model, contents: { parts: [imagePart, { text: miniaturePrompt }] }, config }),
    ai.models.generateContent({ model, contents: { parts: [imagePart, { text: tokenPrompt }] }, config }),
  ]);

  const extractBase64 = (response: any): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return '';
  };

  const miniatureBase64 = extractBase64(miniatureResponse);
  if (!miniatureBase64) throw new Error(getTranslation(language, 'errorMiniatureGeneration'));

  const tokenBase64 = extractBase64(tokenResponse);
  if (!tokenBase64) throw new Error(getTranslation(language, 'errorTokenGeneration'));

  return {
    miniature: `data:image/png;base64,${miniatureBase64}`,
    token: `data:image/png;base64,${tokenBase64}`,
  };
};


const itemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The name of the item." },
        description: { type: Type.STRING, description: "A detailed physical and historical description of the item." },
        effect: { type: Type.STRING, description: "The mechanical effect of the item in a TTRPG context." },
        value: { type: Type.STRING, description: "The estimated value of the item in gold pieces (e.g., '50 gp')." },
        rarity: { type: Type.STRING, description: "The rarity of the item." },
        isMagical: { type: Type.BOOLEAN, description: "Whether the item is magical." },
        attunement: { type: Type.BOOLEAN, description: "Whether the item requires attunement." },
    },
    required: ["name", "description", "effect", "value", "rarity", "isMagical", "attunement"],
};

export const generateItem = async (options: {
  language: Language;
  aspectRatio: AspectRatio;
  name?: string;
  isMagical?: boolean;
  rarity?: string;
}): Promise<{ itemData: any; imageUrl: string }> => {
  const {language, aspectRatio, name, isMagical, rarity} = options;
  const itemPrompt = name 
    ? getTranslation(language, 'prompts.itemSpecific', { name, isMagical: isMagical ? getTranslation(language, 'magical') : getTranslation(language, 'notMagical'), rarity: rarity! })
    : getTranslation(language, 'prompts.itemRandom');

  const textModel = 'gemini-2.5-pro';

  const textResponse = await ai.models.generateContent({
    model: textModel,
    contents: itemPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: itemSchema,
    },
  });

  // FIX: Added .trim() to make JSON parsing more robust.
  const itemData = JSON.parse(textResponse.text.trim());

  const imagePrompt = getTranslation(language, 'prompts.itemImage', { name: itemData.name, description: itemData.description });
  
  const imageModel = 'imagen-4.0-generate-001';
  const imageResponse = await ai.models.generateImages({
    model: imageModel,
    prompt: imagePrompt,
    config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/png',
    }
  });

  const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;
  if (!imageBase64) throw new Error(getTranslation(language, 'errorItemImageGeneration'));

  return {
    itemData,
    imageUrl: `data:image/png;base64,${imageBase64}`,
  };
};

const scenarioSchema = {
  type: Type.OBJECT,
  properties: {
      name: { type: Type.STRING, description: "The evocative name of the scenario." },
      detailedDescription: { type: Type.STRING, description: "A detailed description of the scenario, including sensory details, potential plot hooks, and notable features." },
  },
  required: ["name", "detailedDescription"],
};

export const generateScenario = async (options: {
  language: Language;
  aspectRatio: AspectRatio;
  name?: string;
  shortDescription?: string;
}): Promise<{ scenarioData: any; imageUrl: string }> => {
  const { language, aspectRatio, name, shortDescription } = options;
  const scenarioPrompt = name && shortDescription
    ? getTranslation(language, 'prompts.scenarioSpecific', { name, description: shortDescription })
    : getTranslation(language, 'prompts.scenarioRandom');

  const textModel = 'gemini-2.5-pro';

  const textResponse = await ai.models.generateContent({
    model: textModel,
    contents: scenarioPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: scenarioSchema,
    },
  });

  // FIX: Added .trim() to make JSON parsing more robust.
  const scenarioData = JSON.parse(textResponse.text.trim());
  
  const imagePrompt = getTranslation(language, 'prompts.scenarioImage', { name: scenarioData.name, description: scenarioData.detailedDescription });

  const imageModel = 'imagen-4.0-generate-001';
  const imageResponse = await ai.models.generateImages({
    model: imageModel,
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      outputMimeType: 'image/png',
    },
  });

  const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;
  if (!imageBase64) throw new Error(getTranslation(language, 'errorScenarioImageGeneration'));

  return {
    scenarioData,
    imageUrl: `data:image/png;base64,${imageBase64}`,
  };
};

// --- NPC Generation Service ---

const npcStatBlockSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        size: { type: Type.STRING },
        type: { type: Type.STRING },
        subtype: { type: Type.STRING },
        alignment: { type: Type.STRING },
        ac: { type: Type.NUMBER },
        hp: { type: Type.NUMBER },
        hit_dice: { type: Type.STRING },
        speed: { type: Type.STRING },
        stats: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        proficiencyBonus: { type: Type.STRING },
        saves: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
        skillsaves: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
        damage_vulnerabilities: { type: Type.STRING },
        damage_resistances: { type: Type.STRING },
        damage_immunities: { type: Type.STRING },
        condition_immunities: { type: Type.STRING },
        senses: { type: Type.STRING },
        languages: { type: Type.STRING },
        cr: { type: Type.STRING },
        characterLevel: { type: Type.NUMBER },
        traits: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        actions: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        reactions: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        legendary_actions: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        spells: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
};


const npcSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        npcType: { type: Type.STRING, enum: ['ally', 'neutral', 'enemy'] },
        race: { type: Type.STRING },
        class: { type: Type.STRING },
        gender: { type: Type.STRING },
        age: { type: Type.STRING },
        description: { type: Type.STRING },
        personality: { type: Type.STRING },
        belongings: { type: Type.STRING },
        scenery: { type: Type.STRING },
        statBlock: npcStatBlockSchema,
    },
    required: ["name", "npcType", "race", "class", "gender", "age", "description", "personality", "belongings", "scenery", "statBlock"]
};

export const generateNpcPackage = async (options: {
  language: Language;
  npcType: NpcType;
  gender: NpcGender;
}): Promise<GeneratedNpcPackage> => {
  const { language, npcType, gender } = options;

  // Step 1: Generate all textual data for the NPC
  const npcTextPrompt = getTranslation(language, 'prompts.npcRandom', {
    npcType: getTranslation(language, `npcType.${npcType}`),
    gender: getTranslation(language, `gender.${gender}`),
  });

  const textModel = 'gemini-2.5-pro';
  const textResponse = await ai.models.generateContent({
    model: textModel,
    contents: npcTextPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: npcSchema,
    },
  });

  // FIX: Added .trim() to make JSON parsing more robust.
  const npcData: GeneratedNpc = JSON.parse(textResponse.text.trim());

  // Step 2: Generate the portrait image based on the text data
  const imagePrompt = getTranslation(language, 'prompts.npcImage', {
    name: npcData.name,
    race: npcData.race,
    class: npcData.class,
    description: npcData.description,
    scenery: npcData.scenery,
  });
  
  const imageModel = 'imagen-4.0-generate-001';
  const imageResponse = await ai.models.generateImages({
    model: imageModel,
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: AspectRatio.PORTRAIT,
      outputMimeType: 'image/png',
    },
  });

  const portraitBase64 = imageResponse.generatedImages[0].image.imageBytes;
  if (!portraitBase64) throw new Error(getTranslation(language, 'errorNpcImageGeneration'));

  // Step 3: Generate the miniature and token from the portrait
  const creatureTypeMap: Record<NpcType, CreatureType> = {
    enemy: 'enemy',
    ally: 'ally',
    neutral: 'npc',
  };
  const creatureType = creatureTypeMap[npcData.npcType];

  const { miniature, token } = await generateMiniatureAndToken(
    npcData.name,
    portraitBase64,
    'image/png',
    creatureType,
    npcData.scenery,
    language
  );

  return {
    npcData,
    portraitUrl: `data:image/png;base64,${portraitBase64}`,
    miniatureUrl: miniature,
    tokenUrl: token,
  };
};