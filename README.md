# LifeXp Health Care App

LifeXp is a React Native + Expo healthcare application with a companion Express backend. It supports patient and doctor accounts, family health tracking, AI-powered chat assistance, doctor recommendations, analytics, and notifications.

## Key Features

- Patient and doctor registration flow
- Family member tracking and health grouping
- Personalized dashboard with daily wellness data
- Doctor reports and recommendations for medicines, workouts, and nutrition
- Analytics view for health trends over time
- In-app notifications and AI chat assistant
- Expo mobile app with cross-platform support for Android, iOS, and web
- Backend API using Express and MongoDB

## Repository Structure

- `App.js` - root Expo app entry point
- `src/` - React Native app source code
- `src/navigation/` - navigation stack and bottom tab layout
- `src/screens/` - app screens for login, dashboard, family, chat, analytics, reports, and more
- `src/api/client.js` - app API client configuration
- `life_xp-backend/` - Express backend service
- `life_xp-backend/server.js` - backend server entry point
- `life_xp-backend/routes/` - backend API routes
- `life_xp-backend/db/` - MongoDB connection helper

## Local Setup

### 1. Install dependencies

From the repo root:

```bash
npm install
```

Then install backend dependencies:

```bash
cd life_xp-backend
npm install
cd ..
```

### 2. Start the backend

From the backend folder:

```bash
cd life_xp-backend
npm run dev
```

By default the backend listens on `http://localhost:3001` and exposes API routes under `/api`.

### 3. Start the Expo app

From the repo root:

```bash
npm start
```

Then choose your target device:

- Android emulator
- iOS simulator
- web browser
- physical device via Expo Go

### 4. Backend connection notes

The app uses `src/api/client.js` to compute the backend host:

- Android emulator: `10.0.2.2`
- iOS simulator / web: `localhost`
- Physical device: use your development machine IP and set `EXPO_PUBLIC_API_URL`

If you need a custom API base URL, set `EXPO_PUBLIC_API_URL` before starting Expo.

## Available Scripts

From the root:

- `npm start` - launch Expo
- `npm run android` - start Expo for Android
- `npm run ios` - start Expo for iOS
- `npm run web` - start Expo for web
- `npm run lint` - lint app source files
- `npm run reset-project` - reset starter content

From the backend:

- `npm run dev` - run backend in watch mode
- `npm start` - run backend server once

## Environment

The backend uses environment variables loaded from `.env` via `dotenv`.

Common values:

- `PORT` - backend HTTP port (defaults to `3001`)
- MongoDB connection info is configured in `life_xp-backend/db/mongo.js`

## Notes

- The app is built with Expo SDK 56 and React Native 0.85.
- The backend is a lightweight Express API with CORS and JSON body parsing.
- The app supports voice assist, AI chat, doctor reports, and health analytics.

## License

This project is licensed under the terms of the existing `LICENSE` file.
