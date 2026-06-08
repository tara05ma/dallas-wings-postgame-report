import { useState, useEffect } from 'react';
import { fetchGameData } from '../services/espn';
import { generateReport } from '../services/groq';
import { bueckersAvailable2025 } from '../data/games';
import './ReportView.css';

export default function ReportView({ game, onBack }) {
  const [status, setStatus] = useState('loading');
  const [gameData, setGameData] = useState(null);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    run();
  }, [game]);

  async function run() {
    try {
      setStatus('fetching');
      const data = await fetchGameData(game.id, game.home);
      setGameData(data);
      setStatus('generating');
      const text = await generateReport(data, game);
      setReport(text);
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }

  const bueckersPlayed = game.season === 2025
    ? bueckersAvailable2025[game.id]
    : true; // assume available in 2026

  if (status === 'loading' || status === 'fetching' || status === 'generating') {
    return (
      <div className="loading-screen">
        <div className="loading-pulse">
          <div className="pulse-ring" />
          <div className="pulse-ring delay1" />
          <div className="pulse-ring delay2" />
        </div>
        <p className="loading-text">
          {status === 'fetching' ? 'Pulling play-by-play data...' : 'Generating match report...'}
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="error-screen">
        <p>⚠️ {error}</p>
        <button onClick={onBack} className="back-btn">← Back</button>
      </div>
    );
  }

  const { wingsFinal, oppFinal, wingsHalftime, oppHalftime,
    firstHalfStats, secondHalfStats, quarterPoints, topScorers } = gameData;

  const won = wingsFinal > oppFinal;

  return (
    <div className="report">
      {/* Header */}
      <div className="report-header">
        <button onClick={onBack} className="back-btn">← All Games</button>
        <div className={`result-banner ${won ? 'win' : 'loss'}`}>
          {won ? 'VICTORY' : 'DEFEAT'}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="team-score">
          <div className="team-name">Dallas Wings</div>
          <div className={`final-score ${won ? 'win-score' : 'loss-score'}`}>{wingsFinal}</div>
        </div>
        <div className="score-meta">
          <div className="game-info-text">{game.date}</div>
          <div className="game-info-text">{game.home ? 'Home' : 'Away'} vs {game.opponent}</div>
          <div className="halftime-text">HT: {wingsHalftime}–{oppHalftime}</div>
          {bueckersPlayed !== undefined && (
            <div className={`bueckers-badge ${bueckersPlayed ? 'played' : 'out'}`}>
              {bueckersPlayed ? '✓ Bueckers Active' : '✗ Bueckers Out'}
            </div>
          )}
        </div>
        <div className="team-score right">
          <div className="team-name">{game.opponent}</div>
          <div className={`final-score ${!won ? 'win-score' : 'loss-score'}`}>{oppFinal}</div>
        </div>
      </div>

      {/* Quarter Breakdown */}
      <div className="section-title">Quarter Breakdown</div>
      <div className="quarters-grid">
        {quarterPoints.map(q => (
          <div key={q.quarter} className="quarter-card">
            <div className="quarter-label">Q{q.quarter}</div>
            <div className={`quarter-score wings ${q.wings > q.opp ? 'better' : ''}`}>{q.wings}</div>
            <div className="quarter-divider">–</div>
            <div className={`quarter-score opp ${q.opp > q.wings ? 'better' : ''}`}>{q.opp}</div>
          </div>
        ))}
      </div>

      {/* Stats Comparison */}
      <div className="section-title">First Half vs Second Half</div>
      <div className="stats-comparison">
        <div className="stats-col">
          <div className="stats-col-title">First Half</div>
          <StatRow label="FG%" value={`${(firstHalfStats.fgPct * 100).toFixed(1)}%`} />
          <StatRow label="Turnovers" value={firstHalfStats.turnovers} />
          <StatRow label="Def Rebounds" value={firstHalfStats.defRebounds} />
          <StatRow label="Assists" value={firstHalfStats.assists} />
          <StatRow label="FT Attempts" value={firstHalfStats.ftAttempts} />
        </div>
        <div className="stats-divider" />
        <div className="stats-col">
          <div className="stats-col-title">Second Half</div>
          <StatRow label="FG%" value={`${(secondHalfStats.fgPct * 100).toFixed(1)}%`} />
          <StatRow label="Turnovers" value={secondHalfStats.turnovers} />
          <StatRow label="Def Rebounds" value={secondHalfStats.defRebounds} />
          <StatRow label="Assists" value={secondHalfStats.assists} />
          <StatRow label="FT Attempts" value={secondHalfStats.ftAttempts} />
        </div>
      </div>

      {/* Top Scorers */}
      {topScorers.length > 0 && (
        <>
          <div className="section-title">Top Performers</div>
          <div className="scorers-list">
            {topScorers.map((s, i) => (
              <div key={i} className="scorer-row">
                <div className="scorer-rank">{i + 1}</div>
                <div className="scorer-name">{s.name}</div>
                <div className="scorer-pts">{s.points} PTS</div>
                <div className="scorer-bar">
                  <div
                    className="scorer-bar-fill"
                    style={{ width: `${(s.points / topScorers[0].points) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI Report */}
      <div className="section-title">Match Report</div>
      <div className="ai-report">
        <div className="report-badge">AI Generated</div>
        <p className="report-text">{report}</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}