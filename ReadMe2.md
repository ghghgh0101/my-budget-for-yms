# 💷 Global Wallet (Working Title)

A multi-currency expense tracker designed for travelers and expats to manage finances across borders.

## 🚀 Live Demo
[Insert Vercel Deployment Link Here]

## 🧐 Problem Statement
Managing finances in a foreign country is chaotic. Dealing with multiple currencies (GBP, KRW) and splitting bills with housemates often leads to calculation errors and awkward money conversations.

## 💡 Solution
**Global Wallet** solves this by providing:
- Real-time exchange rate conversion using external APIs.
- A "Dutch Pay" system that automatically handles split calculations.
- Dual-currency dashboard to view assets in both Home and Local currencies.

## 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (Serverless), Supabase (PostgreSQL)
- **Testing:** Jest, React Testing Library
- **CI/CD:** GitHub Actions, Vercel

## ⚙️ How to Run Locally
1. Clone the repo
   `git clone https://github.com/your-username/global-wallet.git`
2. Install packages
   `npm install`
3. Set up environment variables (.env.local)
4. Run the development server
   `npm run dev`
5. Run tests
   `npm run test`