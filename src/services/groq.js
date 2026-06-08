const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function generateReport(gameData, gameInfo) {
  const { wingsFinal, oppFinal, wingsHalftime, oppHalftime,
    firstHalfStats, secondHalfStats, quarterPoints, topScorers } = gameData;

  const result = wingsFinal > oppFinal ? 'WIN' : 'LOSS';
  const scorersList = topScorers.map(s => `${s.name} (${s.points} pts)`).join(', ');
  const qpString = quarterPoints.map(q => `Q${q.quarter}: Wings ${q.wings} - ${q.opp} Opp`).join(' | ');

  const prompt = `You are a professional WNBA sports analyst writing a post-game report for the Dallas Wings.

Game: Dallas Wings vs ${gameInfo.opponent} — ${gameInfo.date}
Result: ${result} ${wingsFinal}-${oppFinal}
Location: ${gameInfo.home ? 'Home' : 'Away'}

Quarter by Quarter: ${qpString}
Halftime: Wings ${wingsHalftime} - ${oppHalftime} ${gameInfo.opponent}

FIRST HALF STATS (Dallas Wings):
- Field Goal %: ${(firstHalfStats.fgPct * 100).toFixed(1)}%
- Turnovers: ${firstHalfStats.turnovers}
- Defensive Rebounds: ${firstHalfStats.defRebounds}
- Assists: ${firstHalfStats.assists}
- Free Throw Attempts: ${firstHalfStats.ftAttempts}

SECOND HALF STATS (Dallas Wings):
- Field Goal %: ${(secondHalfStats.fgPct * 100).toFixed(1)}%
- Turnovers: ${secondHalfStats.turnovers}
- Defensive Rebounds: ${secondHalfStats.defRebounds}
- Assists: ${secondHalfStats.assists}
- Free Throw Attempts: ${secondHalfStats.ftAttempts}

TOP SCORERS: ${scorersList}

Write a professional, insightful 200-word match report with:
1. A punchy opening line summarizing the game
2. Key first half analysis
3. What changed (or didn't) in the second half
4. Standout performers
5. One forward-looking sentence about what this means for the Wings

Be specific, use the numbers, sound like ESPN or The Athletic. Write in flowing paragraphs, no bullet points.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Report generation failed');
  }
  
  return data.choices[0].message.content;
}