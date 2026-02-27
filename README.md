# Git History Time Traveller - Cinematic Git Visualizer

Git History Time Traveller is a production-ready, highly interactive full-stack Next.js 14 application that visualizes a given Git repository's history. It highlights technical debt, contributor networks, and file churn in a beautiful cinematic dark-themed UI.

## Features

- **Cinematic Timeline (Time Travel Mode):** Watch commits appear over time with a slider scrubber, speed playback options, and smooth animations using Framer Motion.
- **Contributor Network Graph:** A dynamic D3 force-directed graph to visualize contributors and their collaboration patterns.
- **File Churn Heatmap:** An interactive heatmap showcasing the top hotspot files and their modification intensity over time.
- **Technical Debt & AI Insights Panel:** Provides AI-generated insights on technical debt risks, maintenance hotspots, team productivity, and refactoring suggestions.
- **Dark Futuristic Theme:** A deep space visual theme utilizing Tailwind CSS and glassmorphism.

## Requirements

- Node.js 18+
- Git installed on your local machine (required for cloning logic internally)

## Environment Setup

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
```
*(If the key is not provided, the application will provide graceful fallback mock insights for demonstration purposes.)*

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, D3.js, Lucide-React.
- **Backend:** Next.js API Routes (`/api/parse` and `/api/ai`).
- **Git Parsing:** Uses `simple-git` to clone a repository into a temporary system directory, extracting `--numstat` commit logs, separating into insertions/deletions/changes, and mapping out a network graph of file alterations.

## Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and create a new project.
3. Import the GitHub project. 
4. In the Environment Variables section, add `OPENAI_API_KEY`.
5. Deploy. (Note: The `/api/parse` route allows a maximum duration of 60 seconds. Vercel's serverless runtime will execute the `simple-git` operations directly.)
