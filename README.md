# BusMate BD

Your Smart Companion for Dhaka Local Buses. BusMate BD is a smart web-based transportation platform designed to improve the daily commuting experience of passengers using local buses in Dhaka, Bangladesh.

## Features

*   **Smart Bus Route Finding**: Find the best routes from A to B.
*   **Live Bus Tracking**: Real-time GPS tracking (simulated for demo).
*   **Community-Powered Location Updates**: Crowd status reports.
*   **Fare Calculation**: Get estimated fares for your journey.
*   **AI-Powered Route Assistance**: Ask questions to an AI assistant.
*   **Bus Arrival Prediction**: Get estimated arrival times (ETA).
*   **Bus & Driver Ratings**: Rate your experience.
*   **SOS Emergency Services**: Quick access to emergency alerts.
*   **Lost & Found**: Report and find lost items.
*   **Role-Based Dashboards**: Separate views for Passengers, Drivers, Operators, and Admins.

## Technology Stack

*   **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query, Leaflet, Socket.IO Client.
*   **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM, JWT Authentication.
*   **Database**: PostgreSQL.
*   **Deployment**: Render Blueprint.

## Folder Structure

```
Busmate BD/
├── backend/          # Node.js + Express API Server
├── frontend/         # React + Vite Web App
├── prisma/           # Database Schema, Migrations, and Seed
├── render.yaml       # Render Deployment Blueprint
├── README.md         # This file
└── .env.example      # Example environment variables
```

## Quick Start (Local Development)

### 1. Database Setup

Ensure you have PostgreSQL installed and running. Create a database named `busmate_bd`.

### 2. Environment Variables

Create `.env` files in both `backend` and `frontend` directories based on the `.env.example` templates.

### 3. Backend Setup

```bash
cd backend
npm install
npm run db:setup  # Runs migrations, generates Prisma client, and seeds data
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the App

Open `http://localhost:5173` in your browser.

## Demo Credentials

The database is seeded with the following demo accounts (Password for all: `Demo@2024!`):

*   **Admin**: `admin@busmatebd.demo`
*   **Operator**: `operator@busmatebd.demo`
*   **Driver**: `driver@busmatebd.demo`
*   **Passenger**: `passenger@busmatebd.demo`

## Important Note on Tracking

This application includes a "Demo Tracking Simulator" in the Driver dashboard to demonstrate real-time GPS tracking capabilities without requiring physical GPS hardware. It broadcasts simulated location updates via WebSockets.

## API Documentation

For API documentation, refer to the source code controllers and the main `app.ts` file in the backend directory.
