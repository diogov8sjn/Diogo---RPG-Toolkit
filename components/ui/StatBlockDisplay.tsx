import React from 'react';
import { StatBlock, NpcType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StatBlockDisplayProps {
  statBlock: StatBlock;
  npcType: NpcType;
}

const Section: React.FC<{ title: string; children: React.ReactNode; hasContent: boolean }> = ({ title, children, hasContent }) => {
  if (!hasContent) return null;
  return (
    <>
      <div className="border-t-2 border-red-700 my-2"></div>
      <h4 className="text-lg font-bold text-red-700">{title}</h4>
      <div className="mt-1 space-y-2">{children}</div>
    </>
  );
};

const StatBlockDisplay: React.FC<StatBlockDisplayProps> = ({ statBlock, npcType }) => {
  const { t } = useLanguage();

  const {
    name, size, type, subtype, alignment, ac, hp, hit_dice, speed,
    stats = [10, 10, 10, 10, 10, 10],
    proficiencyBonus,
    saves = [], skillsaves = [],
    damage_vulnerabilities, damage_resistances, damage_immunities, condition_immunities,
    senses, languages, cr, characterLevel,
    traits = [], actions = [], reactions = [], legendary_actions = [], spells = []
  } = statBlock;

  const abilityModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : String(mod);
  };
  
  const abilityKeys: ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  
  const formatSaves = (savesArray: {name: string, value: number}[]) => 
    savesArray.map(s => `${s.name.charAt(0).toUpperCase() + s.name.slice(1)} +${s.value}`).join(', ');

  return (
    <div className="bg-orange-50/95 p-4 rounded-md text-gray-800 font-serif shadow-inner">
      <h3 className="text-2xl font-bold text-red-800">{name}</h3>
      <p className="italic text-sm">{size} {type}{subtype ? ` (${subtype})` : ''}, {alignment}</p>
      
      <div className="border-t-4 border-red-800 my-2"></div>

      <div><span className="font-bold">{t('statBlock.ac')}</span> {ac}</div>
      <div><span className="font-bold">{t('statBlock.hp')}</span> {hp} ({hit_dice})</div>
      <div><span className="font-bold">{t('statBlock.speed')}</span> {speed}</div>
      
      <div className="border-t-4 border-red-800 my-2"></div>

      <div className="grid grid-cols-6 text-center gap-1">
        {abilityKeys.map((key, index) => (
          <div key={key}>
            <div className="font-bold">{t(`statBlock.${key}`)}</div>
            <div>{stats[index]} ({abilityModifier(stats[index])})</div>
          </div>
        ))}
      </div>

      <div className="border-t-4 border-red-800 my-2"></div>
      
      {saves.length > 0 && <div><span className="font-bold">{t('statBlock.saves')}:</span> {formatSaves(saves)}</div>}
      {skillsaves.length > 0 && <div><span className="font-bold">{t('statBlock.skills')}:</span> {formatSaves(skillsaves)}</div>}
      {damage_vulnerabilities && <div><span className="font-bold">Damage Vulnerabilities:</span> {damage_vulnerabilities}</div>}
      {damage_resistances && <div><span className="font-bold">Damage Resistances:</span> {damage_resistances}</div>}
      {damage_immunities && <div><span className="font-bold">Damage Immunities:</span> {damage_immunities}</div>}
      {condition_immunities && <div><span className="font-bold">Condition Immunities:</span> {condition_immunities}</div>}
      {senses && <div><span className="font-bold">{t('statBlock.senses')}:</span> {senses}</div>}
      {languages && <div><span className="font-bold">{t('statBlock.languages')}:</span> {languages}</div>}
      {npcType === 'enemy' && cr && <div><span className="font-bold">{t('statBlock.cr')}:</span> {cr}</div>}
      {(npcType === 'ally' || npcType === 'neutral') && characterLevel && <div><span className="font-bold">{t('statBlock.level')}:</span> {characterLevel}</div>}
      {proficiencyBonus && <div><span className="font-bold">{t('statBlock.proficiencyBonus')}:</span> {proficiencyBonus}</div>}

      <Section title={t('statBlock.traits')} hasContent={traits.length > 0}>
        {traits.map(([traitName, traitDesc]) => (
          <p key={traitName}><span className="font-bold italic">{traitName}.</span> {traitDesc}</p>
        ))}
      </Section>

      <Section title={t('statBlock.spells')} hasContent={spells.length > 0}>
        {spells.map((spellLine, index) => (
          <p key={index}>{spellLine}</p>
        ))}
      </Section>

      <Section title={t('statBlock.actions')} hasContent={actions.length > 0}>
        {actions.map(([actionName, actionDesc]) => (
          <p key={actionName}><span className="font-bold italic">{actionName}.</span> {actionDesc}</p>
        ))}
      </Section>

      <Section title={t('statBlock.reactions')} hasContent={reactions.length > 0}>
        {reactions.map(([reactionName, reactionDesc]) => (
          <p key={reactionName}><span className="font-bold italic">{reactionName}.</span> {reactionDesc}</p>
        ))}
      </Section>

      <Section title={t('statBlock.legendaryActions')} hasContent={legendary_actions.length > 0}>
        {legendary_actions.map(([actionName, actionDesc]) => (
          <p key={actionName}><span className="font-bold italic">{actionName}.</span> {actionDesc}</p>
        ))}
      </Section>
    </div>
  );
};

export default StatBlockDisplay;