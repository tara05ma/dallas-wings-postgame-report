const WINGS_TEAM_ID = '3';

const TURNOVER_TYPES = [
  'Bad Pass Turnover', 'Lost Ball Turnover',
  'Out of Bounds - Lost Ball Turnover',
  'Out of Bounds - Bad Pass Turnover',
  'Offensive Foul Turnover',
  'Out of Bounds - Step Turnover',
  'Traveling'
];

export async function fetchGameData(gameId, isHome) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/summary?event=${gameId}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.plays || data.plays.length === 0) {
    throw new Error('No play data available for this game');
  }

  const plays = data.plays;
  const firstHalf = plays.filter(p => p.period?.number <= 2);
  const secondHalf = plays.filter(p => p.period?.number > 2);
  const lastPlay = plays[plays.length - 1];
  const lastFirstHalfPlay = firstHalf[firstHalf.length - 1];

  const wingsFinal = isHome ? lastPlay.homeScore : lastPlay.awayScore;
  const oppFinal = isHome ? lastPlay.awayScore : lastPlay.homeScore;
  const wingsHalftime = isHome ? lastFirstHalfPlay?.homeScore || 0 : lastFirstHalfPlay?.awayScore || 0;
  const oppHalftime = isHome ? lastFirstHalfPlay?.awayScore || 0 : lastFirstHalfPlay?.homeScore || 0;

  function extractStats(playsSet) {
    const wingPlays = playsSet.filter(p => p.team?.id === WINGS_TEAM_ID);
    const shots = wingPlays.filter(p => p.shootingPlay === true);
    const makes = shots.filter(p => p.scoringPlay === true);
    const fgPct = shots.length > 0 ? makes.length / shots.length : 0;
    const turnovers = wingPlays.filter(p => TURNOVER_TYPES.includes(p.type?.text)).length;
    const assists = wingPlays.filter(p => p.type?.text === 'Assist').length;
    const defRebounds = wingPlays.filter(p => p.type?.text === 'Defensive Rebound').length;
    const offRebounds = wingPlays.filter(p => p.type?.text === 'Offensive Rebound').length;
    const ftAttempts = wingPlays.filter(p => p.type?.text?.includes('Free Throw')).length;
    const threeAttempts = wingPlays.filter(p => p.pointsAttempted === 3).length;
    const foulsDrawn = playsSet.filter(p =>
      ['Shooting Foul', 'Personal Foul'].includes(p.type?.text) &&
      p.team?.id !== WINGS_TEAM_ID
    ).length;
    return { fgPct, turnovers, assists, defRebounds, offRebounds, ftAttempts, threeAttempts, foulsDrawn, shots: shots.length, makes: makes.length };
  }

  const quarters = [];
  for (let q = 1; q <= 4; q++) {
    const qPlays = plays.filter(p => p.period?.number === q);
    if (qPlays.length > 0) {
      const lastQPlay = qPlays[qPlays.length - 1];
      quarters.push({
        quarter: q,
        wings: isHome ? lastQPlay.homeScore : lastQPlay.awayScore,
        opp: isHome ? lastQPlay.awayScore : lastQPlay.homeScore,
      });
    }
  }

  const quarterPoints = quarters.map((q, i) => ({
    quarter: q.quarter,
    wings: i === 0 ? q.wings : q.wings - quarters[i - 1].wings,
    opp: i === 0 ? q.opp : q.opp - quarters[i - 1].opp,
  }));

  // Fixed player name extraction
  const scorerMap = {};
  plays.forEach(p => {
    if (p.scoringPlay && p.team?.id === WINGS_TEAM_ID && p.participants?.length > 0) {
      const athleteId = p.participants[0].athlete?.id;
      const displayName = p.participants[0].athlete?.displayName;
      const nameFromText = p.text?.match(/^(.+?)\s+makes/)?.[1]?.trim();
      const name = displayName || nameFromText || 'Player';
      if (athleteId) {
        if (!scorerMap[athleteId]) scorerMap[athleteId] = { name, points: 0 };
        scorerMap[athleteId].points += p.scoreValue || 0;
      }
    }
  });

  const topScorers = Object.values(scorerMap)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const firstHalfStats = extractStats(firstHalf);
  const secondHalfStats = extractStats(secondHalf);
  const fullGameStats = extractStats(plays);

  return {
    wingsFinal, oppFinal, wingsHalftime, oppHalftime,
    halftimeDiff: wingsHalftime - oppHalftime,
    finalDiff: wingsFinal - oppFinal,
    firstHalfStats, secondHalfStats, fullGameStats,
    quarterPoints, topScorers, totalPlays: plays.length,
  };
}