import React, { useState, useCallback } from 'react';
import { generateScenario } from '../services/geminiService';
import { AspectRatio } from '../types';
import { useLanguage } from '../context/LanguageContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ScenarioGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [generatedScenario, setGeneratedScenario] = useState<{scenarioData: any, imageUrl: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'specific' | 'random' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGeneration = useCallback(async (type: 'specific' | 'random', options: {}) => {
    setIsLoading(true);
    setLoadingType(type);
    setError(null);
    setGeneratedScenario(null);

    try {
      const result = await generateScenario({ language, aspectRatio, ...options });
      setGeneratedScenario(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  }, [aspectRatio, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setError(t('errorScenarioFields'));
      return;
    }
    handleGeneration('specific', { name, shortDescription: description });
  };
  
  const handleRandomSubmit = () => {
    handleGeneration('random', {});
  };

  const handleDownload = (url: string, scenarioName: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = scenarioName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFileName || 'scenario'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFormInvalid = !name || !description;

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-200">{t('createScenarioTitle')}</h2>
          
          <div>
            <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-300 mb-2">
              {t('scenarioName')}
            </label>
            <Input
              id="scenarioName"
              type="text"
              placeholder={t('scenarioNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              {t('scenarioDescription')}
            </label>
            <textarea
              id="description"
              rows={3}
              className="block w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder={t('scenarioDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('aspectRatio')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.values(AspectRatio).map((ratio) => (
                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Button
              type="submit"
              disabled={isFormInvalid}
              isLoading={isLoading && loadingType === 'specific'}
              className="w-full"
            >
              {isLoading && loadingType === 'specific' ? <><Spinner /> <span className="ml-2">{t('generatingScenario')}</span></> : t('generateScenario')}
            </Button>
            <Button
              type="button"
              onClick={handleRandomSubmit}
              isLoading={isLoading && loadingType === 'random'}
              className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
            >
               {isLoading && loadingType === 'random' ? <><Spinner /> <span className="ml-2">{t('generatingScenario')}</span></> : t('generateRandomScenario')}
            </Button>
          </div>
        </form>
      </Card>

      {error && <Card className="border-red-500/50"><p className="text-red-400 text-center">{error}</p></Card>}

      {generatedScenario && (
        <Card>
            <div className="flex flex-col space-y-6">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">{generatedScenario.scenarioData.name}</h2>
                <div className="flex flex-col gap-4">
                    <img src={generatedScenario.imageUrl} alt={generatedScenario.scenarioData.name} className="rounded-lg shadow-2xl w-full h-auto object-contain" />
                    <Button onClick={() => handleDownload(generatedScenario.imageUrl, generatedScenario.scenarioData.name)} className="w-full sm:w-auto sm:self-center">
                        <DownloadIcon />
                        <span className="ml-2">{t('downloadImage')}</span>
                    </Button>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('detailedDescription')}</h3>
                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{generatedScenario.scenarioData.detailedDescription}</p>
                </div>
            </div>
        </Card>
      )}
    </div>
  );
};

export default ScenarioGenerator;