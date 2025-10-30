import React, { useState, useCallback } from 'react';
import { generateItem } from '../services/geminiService';
import { AspectRatio } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
import { useLanguage } from '../context/LanguageContext';

const rarities = ['Comum', 'Incomum', 'Raro', 'Muito Raro', 'Lendário', 'Artefato', 'Amaldiçoado'];

const ItemGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [isMagical, setIsMagical] = useState<boolean | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedItem, setGeneratedItem] = useState<{itemData: any, imageUrl: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isMagical === null || !rarity) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedItem(null);

    try {
      // FIX: The `generateItem` function expects a single object argument.
      // FIX: Added missing 'language' property to the generateItem call.
      const result = await generateItem({ name, isMagical, rarity, aspectRatio, language });
      setGeneratedItem(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [name, isMagical, rarity, aspectRatio, language]);

  const isFormInvalid = isLoading || !name || isMagical === null || !rarity;

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-200">Create a New RPG Item</h2>
          
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-300 mb-2">
              Item Name
            </label>
            <Input
              id="itemName"
              type="text"
              placeholder="e.g., Sun-forged Blade, Cloak of Whispers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsMagical(true)} className={`w-full py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${isMagical === true ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  Mágico
                </button>
                <button type="button" onClick={() => setIsMagical(false)} className={`w-full py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${isMagical === false ? 'bg-gray-400 border-gray-300 text-black' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  Não Mágico
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="rarity" className="block text-sm font-medium text-gray-300 mb-2">
                Rarity
              </label>
               <select id="rarity" value={rarity ?? ''} onChange={(e) => setRarity(e.target.value)} className="block w-full px-4 py-2.5 rounded-md bg-gray-800 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                <option value="" disabled>Select rarity...</option>
                {rarities.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.values(AspectRatio).map((ratio) => (
                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 border-2 ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isFormInvalid} className="w-full">
              {isLoading ? <><Spinner /> <span className="ml-2">Generating Item...</span></> : 'Generate Item'}
            </Button>
          </div>
        </form>
      </Card>

      {error && <Card className="border-red-500/50"><p className="text-red-400 text-center">{error}</p></Card>}

      {generatedItem && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="lg:col-span-1">
                <img src={generatedItem.imageUrl} alt={generatedItem.itemData.name} className="rounded-lg shadow-2xl w-full h-auto object-contain" />
            </Card>
            <Card className="lg:col-span-1 flex flex-col space-y-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{generatedItem.itemData.name}</h2>
                <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Description</h3>
                    <p className="text-gray-300 mt-1">{generatedItem.itemData.description}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Effect</h3>
                    <p className="text-gray-300 mt-1">{generatedItem.itemData.effect}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Value</h3>
                    <p className="text-yellow-400 font-bold mt-1">{generatedItem.itemData.value}</p>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default ItemGenerator;
