# Spotify Clone

A full-stack Spotify-inspired music application built with React, TypeScript, Express, MongoDB, Clerk, Cloudinary, Socket.IO, and Zustand.

The app combines music playback with social features such as real-time messaging, online status, listening activity, and read receipts. It also includes an admin dashboard for managing songs and albums.

> Learning project built as part of my full-stack development practice and extended with authentication, real-time communication, admin tools, responsive UI, and production deployment.

## Live Demo

**[spotify.konradpatla.pl](https://spotify.konradpatla.pl)**

Authentication is handled with Google through Clerk.

## Features

- Google authentication with Clerk
- Browse featured, trending, and personalized music sections
- Album pages with track lists
- Music player with:
  - play / pause
  - previous / next track
  - seek control
  - volume control
- Responsive desktop and mobile layout
- Real-time chat using Socket.IO
- Online / offline user status
- Typing indicators
- Message read receipts
- Live listening activity from other users
- Admin dashboard
- Create and delete songs
- Create and delete albums
- Audio and image uploads with Cloudinary
- MongoDB persistence
- Production deployment behind HTTPS

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand
- Axios
- React Router
- Socket.IO Client
- Clerk
- Lucide React

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- Socket.IO
- Clerk Express
- Cloudinary
- express-fileupload
- node-cron

### Deployment

The production application is hosted on a Linux VPS and served through a reverse proxy with HTTPS.

- Docker
- Caddy
- Hetzner Cloud VPS
- MongoDB Atlas
- Cloudinary

## Project Structure

```text
Spotify-clone/
├── backend/
│   └── src/
│       ├── controller/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── index.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── layout/
│       ├── pages/
│       ├── providers/
│       ├── stores/
│       └── types/
└── package.json
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/konrad3211/Spotify-clone.git
cd Spotify-clone
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
PORT=5001
NODE_ENV=development

MONGODB_URI=

CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAIL=
```

Create a `.env` file inside `frontend/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=
```

Do not commit real credentials or API secrets.

### 4. Start the backend

From `backend/`:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5001
```

### 5. Start the frontend

From `frontend/`:

```bash
npm run dev
```

Vite will start the frontend development server, typically at:

```text
http://localhost:5173
```

## Production Build

From the repository root:

```bash
npm run build
npm start
```

The root build script installs backend and frontend dependencies and creates the frontend production build. In production, Express serves the generated frontend files.

## Real-Time Communication

Socket.IO is used for the social features of the application. Connected users can:

- send and receive messages instantly
- see online users
- see typing indicators
- receive message read updates
- share their current listening activity

Messages are persisted in MongoDB.

## Admin Dashboard

An administrator is identified using the email configured in `ADMIN_EMAIL`.

The admin dashboard allows authorized users to manage the music catalog, including creating and deleting songs and albums. Uploaded images and audio files are stored in Cloudinary.

## Responsive Design

The interface supports both desktop and mobile layouts. On smaller screens, the desktop sidebars are replaced with a compact mobile navigation so the main content, album pages, player, and chat remain usable without horizontal overflow.

## Notes

This project is inspired by Spotify for educational and portfolio purposes. It is not affiliated with or endorsed by Spotify.

## Author

**Konrad Patla**

GitHub: [@konrad3211](https://github.com/konrad3211)
