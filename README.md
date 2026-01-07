# DecisionLog

A modern, full-stack decision tracking web application built with **Next.js** and **FastAPI** to help individuals and teams log, track, and learn from their decisions.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![SQLite](https://img.shields.io/badge/SQLite-Database-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-cyan)

---

## 📸 Screenshots

### Homepage
![Homepage](screenshots/start.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Team Chat
![Team Chat](screenshots/teamchat.png)

### Analytics
![Analytics](screenshots/analytics.png)

### Whiteboard Flow
![Decision Flow](screenshots/decison-flow.png)

### Login Page
![Login](screenshots/login.png)

---

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Secure local JWT-based login/registration
- ✅ **Decision CRUD** - Create, read, update, delete decisions with full context
- ✅ **Dashboard** - View all decisions with search, filter, and sort capabilities
- ✅ **Kanban Board** - Drag-and-drop workflow status (To Do, In Progress, Review, Done)
- ✅ **Visual Whiteboard** - Interactive SVG-based decision flow diagrams
- ✅ **Protected Routes** - Authentication required for dashboard access

### Advanced Features
- 🏷️ **Tags** - Organize decisions with color-coded tags
- 📊 **Analytics** - Visual charts for success rate, confidence trends, and workflow status
- 📋 **Templates** - 6 pre-filled templates for common decision types
- 👥 **Team Spaces** - Collaborate on decisions with invite codes
- ✅ **Voting** - Team approve/reject/abstain votes
- 💬 **Comments** - Follow-up notes on decisions
- 📰 **Activity Feed** - Real-time team activity stream
- 🤖 **Decision Helper** - AI Chatbot to answer questions about your data
- 💬 **Team Chat** - Real-time collaboration in Team Spaces
- 🌙 **Dark Mode** - Theme toggle with system preference respect
- ❓ **Interactive Help** - Built-in tour for new users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | TailwindCSS, Custom CSS Variables |
| Backend | FastAPI (Python) |
| Database | SQLite (Local file-based database) |
| Auth | Custom JWT Authentication (FastAPI + OAuth2PasswordBearer) |
| ORM | SQLAlchemy |
| Hosting | Vercel (Frontend), Any Python host (Backend) |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Clone the repository
```bash
git clone https://github.com/anudeep2710/DecisionLog.git
cd DecisionLog
```

### 2. Set up the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

No complex environment variables needed for local development! The app uses a local SQLite database by default.

### 3. Run the Backend
```bash
venv\Scripts\python main.py
```
The backend API will start at `http://localhost:8000`. It will automatically create the `decisionlog.db` SQLite file.

### 4. Set up the Frontend
Open a new terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env.local` (optional, defaults to localhost:8000):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Run the Frontend
```bash
npm run dev
```

Access at: http://localhost:3000

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/decisions/` | Get all user decisions |
| POST | `/decisions/` | Create a decision |
| PUT | `/decisions/{id}` | Update a decision |
| DELETE | `/decisions/{id}` | Delete a decision |
| GET | `/teams/` | Get user's teams |
| POST | `/teams/` | Create a team |
| POST | `/teams/join` | Join team by code |
| GET | `/tags/` | Get all tags |
| POST | `/tags/` | Create a tag |
| GET | `/comments/decision/{id}` | Get decision comments |
| POST | `/comments/` | Add a comment |
| GET | `/votes/decision/{id}` | Get vote summary |
| POST | `/votes/` | Cast a vote |
| POST | `/bot/query` | Query the AI chatbot |
| GET | `/chat/{team_id}` | Get recent chat messages |
| POST | `/chat/` | Send a chat message |
| GET | `/whiteboards/` | Get all whiteboards |
| POST | `/whiteboards/` | Create a whiteboard |
| GET | `/whiteboards/{id}` | Get specific whiteboard |
| PUT | `/whiteboards/{id}` | Update whiteboard data |
| DELETE | `/whiteboards/{id}` | Delete whiteboard |

📁 **Postman Collection**: `DecisionLog_API.postman_collection.json`

---

## 🔐 Security Features

- **Password Hashing**: SHA256 Crypt (Passlib)
- **JWT Authentication**: Stateless, signed tokens with HS256
- **Protected Routes**: Middleware checks auth on frontend
- **Row Level Security**: Application-level authorization in FastAPI
- **Input Validation**: Pydantic models on backend
- **CORS Configuration**: Restricted to allowed origins

---

## 📈 Scaling Strategy

### Current Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   FastAPI   │────▶│   SQLite    │
│  (Frontend) │     │  (Backend)  │     │ (Local DB)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Production Scaling Recommendations

#### 1. **Switch to PostgreSQL**
For production deployment, switch the `DATABASE_URL` environment variable in the backend to point to a PostgreSQL instance (e.g., Supabase, RDS, Railway). SQLAlchemy handles the dialect switch automatically.

#### 2. **Horizontal Scaling**
Deploy the FastAPI backend on a scalable platform like Railway or Render.

#### 3. **Caching Layer**
Add Redis for session/token caching or response caching if needed.

---

## 📁 Project Structure

```
DecisionLog/
├── frontend/
│   ├── app/                    # Next.js pages
│   │   ├── dashboard/          # Protected dashboard
│   │   ├── login/              # Auth pages
│   │   ├── register/
│   │   ├── analytics/
│   │   └── features/
│   ├── components/             # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── DecisionForm.tsx
│   │   ├── TagSelector.tsx
│   │   ├── VotingPanel.tsx
│   │   └── HelpTour.tsx
│   └── lib/                    # Utilities
│
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── auth.py                 # JWT authentication
│   ├── database.py             # DB connection (SQLAlchemy)
│   ├── models.py               # SQLAlchemy models
│   └── routers/                # API routes
│       ├── decisions.py
│       ├── teams.py
│       ├── tags.py
│       ├── comments.py
│       ├── votes.py
│       ├── chat.py
│       └── bot.py
│   └── test_comprehensive.py   # Test suite
│
├── supabase_schema.sql         # Legacy schema reference
└── DecisionLog_API.postman_collection.json
```

---

## 👨‍💻 Author

**Anudeep Batchu**

---

## 📄 License

MIT License - feel free to use this project for learning and development.
