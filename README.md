# EconQuest – Gamified Economics Learning Platform

Learn economics by playing quests, not memorizing definitions. EconQuest turns Micro, Macro, and personal finance into an addictive game.

## 🚀 What is EconQuest?
EconQuest is a gamified learning platform where students master economics through quests, challenges, quizzes, AI tutoring, and social squads instead of boring PDFs and lectures.

Students earn XP, coins, achievements, and squad glory while actually understanding concepts like demand, GDP, inflation, and market structures.

---

## ✨ Core Features (Why judges should care)

🎯 **Gamified Dashboard** – Live XP, coins, streak, rank, level, “Today’s Focus” card, and XP progression chart.

📚 **Quest Arena** – Structured tracks (Micro 101, Macro 101, etc.) with difficulty tags, syllabus tags, and end‑of‑quest quizzes.

🤖 **EconBot (Gemini AI)** – Chatbot for doubts, plus graph/image upload to analyze economic charts instantly.

🎙️ **Live Voice Tutor** – Low‑latency voice conversations using Gemini Live for hands‑free learning.

🛒 **In‑App Shop** – Spend coins on avatars, badges, and cosmetic upgrades.

🏆 **Achievements & Review Arena** – Badges for milestones and a spaced‑repetition Review tab for weak topics.

🧑‍🤝‍🧑 **Squads & Leaderboards** – Global/monthly/weekly leaderboards, squads with chat, shared progress, and scheduled squad missions.

🛠️ **Admin Panel** – Manage quests, quizzes, shop items, syllabus tags, and refresh live platform stats.

📊 **Analytics & Live Stats** – Track quest starts/completions, weakest topics, and live platform metrics with safe Firestore aggregation.

---

## 🧠 Learning Design
EconQuest is not “just a game”; it’s built like a serious ed‑tech product.

- **Tracks & prerequisites** – Quests organized into learning paths (e.g., Microeconomics 101 → Market Structures), with order and track IDs.
- **Quiz feedback** – Every question shows detailed explanation and suggests related lessons when you’re wrong.
- **Spaced repetition** – Wrong answers feed into a Review Arena using a SuperMemo‑style schedule to fix weak spots.
- **Syllabus alignment** – Each quest has tags like “Class 11 – CBSE: Unit 2” or “AP Micro 2.1” for direct curriculum mapping.

---

## 🏗️ Tech Stack

| Layer | Tech |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7, Tailwind CSS, Recharts, React Hot Toast, Lucide Icons, Motion |
| **Backend** | Express server (Node) integrated with Vite middleware |
| **Data/Auth** | Firebase Firestore + Firebase Auth (Google Sign‑In) |
| **AI** | Gemini API (chat, images, graphs, live voice), Lyria for music themes |
| **Infra** | Firestore security rules, analytics & stats services |

---

## 📸 Screenshots

### Landing Page & Story
Hero section with “Start Your Quest” and live stats (students, quests completed, rating).
![Landing Hero](./assets/landing-hero.png)

### Student Dashboard
Streak, rank, level, XP to next level, “Today’s Focus” (weakest topic), XP chart, recommended quest card.
![Dashboard Main](./assets/dashboard-main.png)

### Quest Detail & Quiz
Quest description, difficulty, syllabus tags, lessons, MCQs with detailed explanations and feedback form.
![Quest Detail](./assets/quest-detail.png)

### EconBot & Live Tutor
Floating chat button, graph upload, and live voice session UI with mic controls.
![EconBot Live](./assets/econbot-live.png)

### Squads & Leaderboard
Global leaderboard filters (Global/Monthly/Weekly), squad chat, shared progress bar, and “Conquered” banners on finished missions.
![Squads Leaderboard](./assets/squads-leaderboard.png)

### Admin & About
Admin dashboard with live stats and content management, About page with “For Students / For Schools” and pricing tiers.
![Admin About](./assets/admin-about.png)

---

## ⚙️ Architecture Overview
- **Firestore collections** for users, quests, quizQuestions, reviewItems, questFeedback, shopItems, purchases, squads, messages, user_events, and metadata/global_stats.
- **Security rules** enforce role‑based access for admin actions, squad membership, and per‑user review/feedback data while exposing only a cached global_stats document publicly.
- **Services layer** (analyticsService, statsService, feedbackService, notificationService, geminiService, liveService, musicService) keeps feature logic clean and testable.

---

## 🧪 Core Flows
- **Onboarding** – WelcomeTour + coach marks show Dashboard, starting a quest, using EconBot, and visiting Review.
- **Learn loop** – Dashboard → Recommended quest → Quiz → Feedback → XP/coins → Review → Squad missions.
- **Motivation loop** – Streaks, notifications for broken streaks/unfinished quests, squad progress updates, and victory music after big quests.

---

## 🏁 Getting Started (Local)

1. Install Node 18+ and set up Firebase project & Firestore.
2. Configure Firebase keys and Gemini API key in environment variables (`.env`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

code with Yash ❤️
