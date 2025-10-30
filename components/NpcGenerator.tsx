import React, { useState, useCallback } from 'react';
import { generateNpcPackage } from '../services/geminiService';
import { NpcType, NpcGender, GeneratedNpcPackage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import StatBlockDisplay from './ui/StatBlockDisplay';

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const NpcGenerator: React.FC = () => {
  const [npcType, setNpcType] = useState<NpcType | null>(null);
  const [gender, setGender] = useState<NpcGender | null>(null);
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedNpcPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const npcTypes: { id: NpcType; labelKey: string; colorClass: string; }[] = [
    { id: 'ally', labelKey: 'ally', colorClass: 'border-blue-500 bg-blue-600/80 hover:bg-blue-600' },
    { id: 'neutral', labelKey: 'npc', colorClass: 'border-yellow-500 bg-yellow-600/80 hover:bg-yellow-600' },
    { id: 'enemy', labelKey: 'enemy', colorClass: 'border-red-500 bg-red-600/80 hover:bg-red-600' },
  ];

  const genders: { id: NpcGender; labelKey: string }[] = [
    { id: 'male', labelKey: 'gender.male' },
    { id: 'female', labelKey: 'gender.female' },
    { id: 'any', labelKey: 'gender.any' },
  ];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcType || !gender) {
      setError(t('errorNpcFields'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedPackage(null);

    try {
      const result = await generateNpcPackage({ language, npcType, gender });
      setGeneratedPackage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [npcType, gender, language, t]);

  const handleDownload = (url: string, fileName: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    const safeBaseName = generatedPackage?.npcData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'npc';
    link.download = `${safeBaseName}_${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isFormInvalid = !npcType || !gender;

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-200">{t('createNpcTitle')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('selectNpcType')}</label>
            <div className="grid grid-cols-3 gap-3">
              {npcTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setNpcType(type.id)}
                  className={`px-4 py-3 text-sm font-semibold rounded-md focus:outline-none transition-all duration-200 border-2 ${
                      npcType === type.id
                      ? `${type.colorClass} text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-white/80`
                      : `bg-gray-800 border-gray-600 text-gray-300 ${type.colorClass.split(' ').pop()}`
                  }`}
                >
                  {t(type.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('selectGender')}</label>
            <div className="grid grid-cols-3 gap-3">
              {genders.map((gen) => (
                <button
                  key={gen.id}
                  type="button"
                  onClick={() => setGender(gen.id)}
                  className={`px-4 py-3 text-sm font-semibold rounded-md focus:outline-none transition-all duration-200 border-2 ${
                      gender === gen.id
                      ? 'bg-indigo-600 border-indigo-500 text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-white/80'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t(gen.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isFormInvalid}
              className="w-full"
            >
              {isLoading ? <><Spinner /> <span className="ml-2">{t('generatingNpc')}</span></> : t('generateNpc')}
            </Button>
          </div>
        </form>
      </Card>

      {error && <Card className="border-red-500/50"><p className="text-red-400 text-center">{error}</p></Card>}

      {generatedPackage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 mb-4">
                {generatedPackage.npcData.name}
              </h2>
              <p><span className='font-bold'>{t('description')}:</span> {generatedPackage.npcData.description}</p>
              <p><span className='font-bold'>{t('personality')}:</span> {generatedPackage.npcData.personality}</p>
              <p><span className='font-bold'>{t('belongings')}:</span> {generatedPackage.npcData.belongings}</p>
            </Card>
             <Card>
                <h3 className="text-lg font-semibold text-center mb-4">{t('portrait')}</h3>
                <img src={generatedPackage.portraitUrl} alt="NPC Portrait" className="rounded-lg shadow-2xl w-full"/>
                <Button onClick={() => handleDownload(generatedPackage.portraitUrl, 'portrait')} className="w-full mt-4">
                  <DownloadIcon />
                  <span className="ml-2">{t('downloadPortrait')}</span>
                </Button>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-center mb-2">{t('miniature')}</h3>
                    <img src={generatedPackage.miniatureUrl} alt="NPC Miniature" className="rounded-lg shadow-2xl w-full"/>
                    <Button onClick={() => handleDownload(generatedPackage.miniatureUrl, 'miniature')} className="w-full mt-2 text-xs px-2 py-1">
                        <DownloadIcon />
                        <span className="ml-2">{t('downloadMiniature')}</span>
                    </Button>
                </Card>
                 <Card className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-center mb-2">{t('token')}</h3>
                    <img src={generatedPackage.tokenUrl} alt="NPC Token" className="rounded-lg shadow-2xl w-full"/>
                    <Button onClick={() => handleDownload(generatedPackage.tokenUrl, 'token')} className="w-full mt-2 text-xs px-2 py-1">
                        <DownloadIcon />
                         <span className="ml-2">{t('downloadToken')}</span>
                    </Button>
                </Card>
            </div>
          </div>
          <div className="lg:col-span-2">
            <StatBlockDisplay statBlock={generatedPackage.npcData.statBlock} npcType={generatedPackage.npcData.npcType} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NpcGenerator;
