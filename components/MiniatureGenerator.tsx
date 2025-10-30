import React, { useState, useCallback } from 'react';
import { generateMiniatureAndToken } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { useLanguage } from '../context/LanguageContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

type CreatureType = 'enemy' | 'player' | 'ally' | 'npc';

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l2-2m-2 2l-2-2m2 2V8m0 0l2 2m-2-2L10 8" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MiniatureGenerator: React.FC = () => {
  const [creatureName, setCreatureName] = useState('');
  const [scenery, setScenery] = useState('');
  const [creatureType, setCreatureType] = useState<CreatureType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{miniature: string, token: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const creatureTypes: { id: CreatureType; labelKey: string; colorClass: string; }[] = [
    { id: 'enemy', labelKey: 'enemy', colorClass: 'border-red-500 bg-red-600/80 hover:bg-red-600' },
    { id: 'player', labelKey: 'player', colorClass: 'border-gray-400 bg-gray-500/80 hover:bg-gray-500' },
    { id: 'ally', labelKey: 'ally', colorClass: 'border-blue-500 bg-blue-600/80 hover:bg-blue-600' },
    { id: 'npc', labelKey: 'npc', colorClass: 'border-yellow-500 bg-yellow-600/80 hover:bg-yellow-600' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatureName || !imageFile || !creatureType || !scenery) {
      setError(t('errorAllFields'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      // FIX: Added the missing 'scenery' argument to the function call.
      const resultUrls = await generateMiniatureAndToken(creatureName, imageBase64, imageFile.type, creatureType, scenery, language);
      setGeneratedImages(resultUrls);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [creatureName, imageFile, creatureType, scenery, language, t]);

  const handleDownload = (url: string | undefined, type: 'miniature' | 'token') => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = creatureName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFileName || 'creature'}_${type}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="creatureName" className="block text-sm font-medium text-gray-300 mb-2">
              {t('creatureName')}
            </label>
            <Input
              id="creatureName"
              type="text"
              placeholder={t('creatureNamePlaceholder')}
              value={creatureName}
              onChange={(e) => setCreatureName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="scenery" className="block text-sm font-medium text-gray-300 mb-2">
              {t('scenery')}
            </label>
            <Input
              id="scenery"
              type="text"
              placeholder={t('sceneryPlaceholder')}
              value={scenery}
              onChange={(e) => setScenery(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('creatureType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {creatureTypes.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setCreatureType(type.id)}
                        className={`px-4 py-3 text-sm font-semibold rounded-md focus:outline-none transition-all duration-200 border-2 ${
                            creatureType === type.id
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
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
              {t('creatureImage')}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                   <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain"/>
                ) : (
                    <UploadIcon />
                )}
                <div className="flex text-sm text-gray-500">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 px-1">
                    <span>{t('uploadFile')}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                  </label>
                  <p className="pl-1">{t('dragAndDrop')}</p>
                </div>
                <p className="text-xs text-gray-600">{t('fileTypes')}</p>
              </div>
            </div>
             {imageFile && <p className="text-sm text-gray-400 mt-2">{t('selectedFile', {fileName: imageFile.name})}</p>}
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!creatureName || !imageFile || !creatureType || !scenery}
              className="w-full"
            >
              {isLoading ? <><Spinner /> <span className="ml-2">{t('generating')}</span></> : t('generateMiniatureAndToken')}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="border-red-500/50">
          <p className="text-red-400 text-center">{error}</p>
        </Card>
      )}

      {generatedImages && (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl font-semibold text-center">{t('generatedMiniature')}</h2>
                    <img src={generatedImages.miniature} alt="Generated miniature" className="rounded-lg shadow-2xl max-w-full h-auto object-contain bg-gray-700" style={{maxHeight: '60vh'}}/>
                    <Button onClick={() => handleDownload(generatedImages.miniature, 'miniature')} className="w-full sm:w-auto">
                        <DownloadIcon />
                        <span className="ml-2">{t('downloadMiniature')}</span>
                    </Button>
                </div>
                 <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl font-semibold text-center">{t('generatedToken')}</h2>
                    <img src={generatedImages.token} alt="Generated token" className="rounded-lg shadow-2xl max-w-full h-auto object-contain bg-gray-700" style={{maxHeight: '60vh'}}/>
                    <Button onClick={() => handleDownload(generatedImages.token, 'token')} className="w-full sm:w-auto">
                        <DownloadIcon />
                        <span className="ml-2">{t('downloadToken')}</span>
                    </Button>
                </div>
            </div>
        </Card>
      )}
    </div>
  );
};

export default MiniatureGenerator;