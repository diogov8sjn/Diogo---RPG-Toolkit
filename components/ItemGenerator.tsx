import React, { useState, useCallback } from 'react';
import { generateItem } from '../services/geminiService';
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

const InfoPill: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`text-center rounded-lg px-3 py-2 ${className}`}>
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
        <span className="block text-sm font-medium text-white">{value}</span>
    </div>
);

const ItemGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [isMagical, setIsMagical] = useState<boolean | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedItem, setGeneratedItem] = useState<{itemData: any, imageUrl: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'specific' | 'random' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const rarities = t('rarities') as unknown as string[];

  const handleGeneration = useCallback(async (type: 'specific' | 'random', options: {}) => {
    setIsLoading(true);
    setLoadingType(type);
    setError(null);
    setGeneratedItem(null);

    try {
      const result = await generateItem({ language, aspectRatio, ...options });
      setGeneratedItem(result);
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
    if (!name || isMagical === null || !rarity) {
      setError(t('errorItemFields'));
      return;
    }
    handleGeneration('specific', { name, isMagical, rarity });
  };

  const handleRandomSubmit = () => {
    handleGeneration('random', {});
  };

  const handleDownload = (url: string, itemName: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFileName || 'item'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFormInvalid = !name || isMagical === null || !rarity;

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-200">{t('createItemTitle')}</h2>
          
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-300 mb-2">
              {t('itemName')}
            </label>
            <Input
              id="itemName"
              type="text"
              placeholder={t('itemNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('itemType')}
              </label>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsMagical(true)} className={`w-full py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${isMagical === true ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  {t('magical')}
                </button>
                <button type="button" onClick={() => setIsMagical(false)} className={`w-full py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${isMagical === false ? 'bg-gray-400 border-gray-300 text-black' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  {t('notMagical')}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="rarity" className="block text-sm font-medium text-gray-300 mb-2">
                {t('rarity')}
              </label>
               <select id="rarity" value={rarity ?? ''} onChange={(e) => setRarity(e.target.value)} className="block w-full px-4 py-2.5 rounded-md bg-gray-800 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                <option value="" disabled>{t('selectRarity')}</option>
                {rarities.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
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
              {isLoading && loadingType === 'specific' ? <><Spinner /> <span className="ml-2">{t('generatingItem')}</span></> : t('generateItem')}
            </Button>
            <Button
              type="button"
              onClick={handleRandomSubmit}
              isLoading={isLoading && loadingType === 'random'}
              className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
            >
              {isLoading && loadingType === 'random' ? <><Spinner /> <span className="ml-2">{t('generatingItem')}</span></> : t('generateRandomItem')}
            </Button>
          </div>
        </form>
      </Card>

      {error && <Card className="border-red-500/50"><p className="text-red-400 text-center">{error}</p></Card>}

      {generatedItem && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="lg:col-span-1 flex flex-col gap-4">
                <img src={generatedItem.imageUrl} alt={generatedItem.itemData.name} className="rounded-lg shadow-2xl w-full h-auto object-contain" />
                <Button onClick={() => handleDownload(generatedItem.imageUrl, generatedItem.itemData.name)} className="w-full">
                    <DownloadIcon />
                    <span className="ml-2">{t('downloadImage')}</span>
                </Button>
            </Card>
            <Card className="lg:col-span-1 flex flex-col space-y-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{generatedItem.itemData.name}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-900/50 p-2 rounded-lg">
                    <InfoPill label={t('itemRarity')} value={generatedItem.itemData.rarity} />
                    <InfoPill label={t('itemIsMagical')} value={t(generatedItem.itemData.isMagical ? 'yes' : 'no')} />
                    <InfoPill label={t('itemAttunement')} value={t(generatedItem.itemData.attunement ? 'yes' : 'no')} />
                </div>
                
                <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('itemDescription')}</h3>
                    <p className="text-gray-300 mt-1">{generatedItem.itemData.description}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('itemEffect')}</h3>
                    <p className="text-gray-300 mt-1">{generatedItem.itemData.effect}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('itemValue')}</h3>
                    <p className="text-yellow-400 font-bold mt-1">{generatedItem.itemData.value}</p>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default ItemGenerator;