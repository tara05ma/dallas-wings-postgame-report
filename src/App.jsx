import { useState } from 'react';
import GameSelector from './components/GameSelector';
import ReportView from './components/ReportView';
import './App.css';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [view, setView] = useState('selector');

  const handleGameSelect = (game, season) => {
    setSelectedGame({ ...game, season });
    setView('report');
  };

  const handleBack = () => {
    setSelectedGame(null);
    setView('selector');
  };

  return (
    <div className="app">
      {view === 'selector' ? (
        <GameSelector onSelect={handleGameSelect} />
      ) : (
        <ReportView game={selectedGame} onBack={handleBack} />
      )}
    </div>
  );
}