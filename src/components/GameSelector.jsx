import { useState } from 'react';
import { games2025, games2026 } from '../data/games';
import './GameSelector.css';

export default function GameSelector({ onSelect }) {
  const [season, setSeason] = useState(2025);
  const games = season === 2025 ? games2025 : games2026;

  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;

  return (
    <div className="selector">
      <div className="selector-header">
        <div className="logo-block">
          <div>
            <h1 className="title">Dallas Wings</h1>
            <p className="subtitle">Post Game Report </p>
          </div>
        </div>
        <div className="season-record">
          <span className="record-wins">{wins}W</span>
          <span className="record-dash">–</span>
          <span className="record-losses">{losses}L</span>
        </div>
      </div>

      <div className="season-toggle">
        <button
          className={`toggle-btn ${season === 2025 ? 'active' : ''}`}
          onClick={() => setSeason(2025)}
        >
          2025 Season
        </button>
        <button
          className={`toggle-btn ${season === 2026 ? 'active' : ''}`}
          onClick={() => setSeason(2026)}
        >
          2026 Season
        </button>
      </div>

      <div className="games-table-header">
        <span className="table-col-label">#</span>
        <span className="table-col-label">Matchup</span>
        <span className="table-col-label">Result</span>
        <span className="table-col-label">Score</span>
        <span className="table-col-label"></span>
      </div>

      <div className="games-list">
        {games.map((game, i) => (
          <button
            key={game.id}
            className={`game-row ${game.result === 'W' ? 'win' : game.result === 'L' ? 'loss' : 'upcoming'}`}
            onClick={() => game.result ? onSelect(game, season) : null}
            disabled={!game.result}
          >
            <span className="row-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="row-matchup">
              <span className="row-date">{game.date.toUpperCase()}</span>
              <span className="row-opponent">
                <span className="row-location">{game.home ? 'vs' : '@'}</span>
                {game.opponent}
              </span>
            </div>
            <div className="row-result">
              {game.result ? (
                <span className={`result-pill ${game.result === 'W' ? 'win' : 'loss'}`}>
                  {game.result}
                </span>
              ) : (
                <span className="result-pill upcoming">–</span>
              )}
            </div>
            <span className="row-score">
              {game.result ? `${game.tm} – ${game.opp}` : 'Upcoming'}
            </span>
            <span className="row-generate">
              {game.result ? '' : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}