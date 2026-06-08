# Dallas Wings Postgame Report Generator

An AI-powered sports analytics web app that automatically generates professional post-game reports for the Dallas Wings (WNBA) using real-time ESPN play-by-play data.

![Dashboard](screenshots/dashboard.png)

---

## What It Does

Select any Dallas Wings game from the 2025 or 2026 season and the website:

- Pulls live play-by-play data directly from the ESPN API
- Analyzes first-half vs second-half performance across key metrics
- Breaks down scoring quarter by quarter
- Surfaces top performers with points and contribution bars
- Generates a professional written match report using the Groq LLM API

![Report](screenshots/report1.png)
![Report](screenshots/report2.png)

---

## The Analytics Behind It

The app processes play-by-play data to extract meaningful performance metrics:

- Computes first-half vs second-half splits across FG%, turnovers, 
  defensive rebounds, assists and free throw attempts
- Calculates quarter-by-quarter scoring breakdowns
- Identifies top performers by extracting scoring events per player
- Tracks halftime score differential as a key performance indicator

---


## Setup

1. Clone the repo
```bash
git clone https://github.com/tara05ma/dallas-wings-postgame-report.git
cd dallas-wings-postgame-report
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root:
