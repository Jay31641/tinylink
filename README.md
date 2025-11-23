TinyLink – URL Shortener Web App:

This is my take-home assignment project.
TinyLink is a simple URL shortener similar to bit.ly.
Users can create short links, view stats, and manage all their links in one place.

Live Links:

Frontend (Vercel): https://tinylink-opal.vercel.app/

Backend (Render): https://tinylink-iwdp.onrender.com

Health Check: /healthz


Features:

Create short links from long URLs

Optional custom short code

See total click count

See last clicked time

302 redirect using /code

Delete short links

Stats page for each short link

Simple and responsive UI

Tech Stack:

Frontend:

React.js (Class Components)

CSS (custom classes)

Fetch API

Backend:

Node.js + Express

PostgreSQL (Neon Database)

Render (Hosting)

API Endpoints
Create short link
POST /api/links

Get all links
GET /api/links

Get stats for one link
GET /api/links/:code

Delete a link
DELETE /api/links/:code

Health Check
GET /healthz

Environment Variables
Backend (.env)
DATABASE_URL=your_neon_url
PORT=10000

How to Run Locally
Backend
cd backend
npm install
npm start

Frontend
cd frontend
npm install
npm start

About This Project

This project was part of a job assignment to show full-stack skills.
I built everything step by step — backend, database, frontend, deployment — and made sure it works end-to-end.
