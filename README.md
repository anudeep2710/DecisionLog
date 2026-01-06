# DecisionLog

A Secure Personal Decision-Tracking & Reflection Dashboard.

Engineers make decisions every day. This app helps users log decisions, track outcomes, and learn from patterns.

## Why DecisionLog?
Modern engineers and product teams make fast decisions but rarely track outcomes. DecisionLog is a lightweight internal tool that helps individuals and teams improve judgment over time by reflecting on past decisions.

## Features
- **Dashboard**: Track Total, Success rate, and Learnings.
- **Decision Tracking**: Log decisions with context, confidence levels, and choices.
- **Outcomes**: Review decisions as Success, Failure, or Unknown.
- **Search & Filter**: filtering by status.
- **Secure**: Authentication via Supabase (JWT).

## Stack
- **Frontend**: Next.js (React), TailwindCSS (White Sketch Theme).
- **Backend**: FastAPI (Python), Supervisors Supabase Client.
- **Database**: Supabase (PostgreSQL) + RLS Policies.

## Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` or `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python main.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Scalability & Architecture
- **Entity Isolation**: All queries are scoped by `user_id` via RLS policies and backend logic.
- **Service Abstraction**: Frontend uses a typed Supabase client, easily swappable for a custom API layer.
- **Stateless Backend**: FastAPI handles logic without storing state, allowing horizontal scaling.
- **Indexed Fields**: Database schema is optimized for common query patterns (status, outcome).

## Visual Style
Features a custom "White Sketch" aesthetic design for a clean, technical, and engineering-focused look.
