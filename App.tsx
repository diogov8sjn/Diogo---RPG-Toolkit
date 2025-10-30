import React, { useState } from 'react';
import MiniatureGenerator from './components/MiniatureGenerator';
import ItemGenerator from './components/ItemGenerator';
import ScenarioGenerator from './components/ScenarioGenerator';
import NpcGenerator from './components/NpcGenerator';
import TabButton from './components/ui/TabButton';
import { useLanguage } from './context/LanguageContext';
import { Language } from './types';

type Tab = 'miniature' | 'item' | 'scenario' | 'npc';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('miniature');
  const { language, setLanguage, t } = useLanguage();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'miniature':
        return <MiniatureGenerator />;
      case 'item':
        return <ItemGenerator />;
      case 'scenario':
        return <ScenarioGenerator />;
      case 'npc':
        return <NpcGenerator />;
      default:
        return null;
    }
  };
  
  const tabs: {id: Tab, labelKey: string}[] = [
      { id: 'miniature', labelKey: 'miniatureGenerator' },
      { id: 'item', labelKey: 'itemGenerator' },
      { id: 'scenario', labelKey: 'scenarioGenerator' },
      { id: 'npc', labelKey: 'npcGenerator' },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans antialiased">
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    RPG Toolbox
                </h1>
                <p className="mt-2 text-lg text-gray-400">{t('appSubtitle')}</p>
            </header>

            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            isActive={activeTab === tab.id}
                        >
                            {t(tab.labelKey)}
                        </TabButton>
                    ))}
                </div>
            </div>
            
            <main>
                {renderActiveTab()}
            </main>

            <footer className="mt-12 text-center text-gray-500 text-sm">
                 <div className="flex justify-center items-center space-x-4 mb-4">
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded ${language === 'en' ? 'bg-indigo-600' : 'bg-gray-700'}`}>English</button>
                    <button onClick={() => setLanguage('pt')} className={`px-3 py-1 rounded ${language === 'pt' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Português</button>
                </div>
                <p>{t('footerText')}</p>
            </footer>
        </div>
    </div>
  );
};

export default App;