# Frontend Checklist

Welcome to the Frontend Checklist project, a Next.js web application.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine. We recommend using version 18.x or later.

## Getting Started

Follow these steps to set up the project locally:

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open the application:**
   
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `app/page.tsx` or the components. The page auto-updates as you edit the file.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production to the `.next` folder.
- `npm run start`: Starts the local server with the production build.
- `npm run lint`: Runs ESLint to check for linting errors.

## Security

This repository includes a GitHub Actions workflow that automatically checks for vulnerabilities using `npm audit` on every push and pull request to the `main` branch. This helps ensure the project dependencies remain secure.
