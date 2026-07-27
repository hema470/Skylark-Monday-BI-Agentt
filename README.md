# Skylark Monday BI Agent 🦅

An Executive AI Business Intelligence Agent that connects dynamically to **Monday.com** via the **Monday GraphQL API**, normalizes real-time enterprise data from **Deals** and **Work Orders** boards, and leverages **Google Gemini AI** to answer founder-level business questions.

---

## 🌟 Architecture & Tech Stack

### **Frontend**
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Custom Glassmorphic Dark Design System + Tailwind CSS
- **Icons:** Lucide React
- **Deployment Target:** Vercel

### **Backend**
- **Framework:** FastAPI (Python 3.11+)
- **API Server:** Uvicorn (Async ASGI server)
- **Data Normalization:** Built-in Data Cleaners & Sanitizer Engine
- **Data Fetching:** Async HTTP Client (`httpx`) with Exponential Backoff & Retry Logic
- **Deployment Target:** Render

### **AI & Data Integration**
- **GraphQL Engine:** Monday.com GraphQL API v2 (`https://api.monday.com/v2`)
- **LLM Reasoning:** Google Gemini API (`gemini-1.5-flash`) with structured BI prompts

---

## 🚀 Key Features

1. **Live Monday.com GraphQL Integration:**
   - Dynamically queries **Board 1 (Deals)** and **Board 2 (Work Orders)**.
   - Robust `executeGraphQL()` with retry and error handling.
   - Zero crash guarantee with comprehensive data normalization.

2. **Automated Enterprise Data Cleaning:**
   - Handles missing, blank, or `null` values.
   - Normalizes currency formats (`$150,000`, `150k`, `150000.00`).
   - Normalizes dates into standard `YYYY-MM-DD`.
   - Standardizes sector taxonomy (e.g. Energy, Manufacturing, Healthcare, Finance, Retail).
   - Deduplicates duplicate records and filters invalid data.

3. **Founder-Level BI Analytics:**
   - **Revenue & Pipeline:** Closed Won Revenue, Active Pipeline Value, Avg Deal Size.
   - **Win / Loss Ratios:** Win Rate %, Loss Rate %.
   - **Operational Delivery:** Total Work Orders, Completed %, Pending Orders, Delayed Work Orders, Cycle Times.
   - **Sector Comparison:** Head-to-Head analysis (e.g. *Energy vs. Manufacturing*).

4. **Executive AI Assistant & Chatbot:**
   - Responds to natural language questions:
     - *"How is our pipeline?"*
     - *"Revenue this quarter"*
     - *"Top sectors"*
     - *"Delayed work orders"*
     - *"Average completion time"*
     - *"Projects completed this month"*
     - *"Compare Energy vs Manufacturing"*
   - Automatic intent detection and **clarifying question prompts** when queries are broad or ambiguous.

5. **Executive Leadership Briefing Generator:**
   - Generates standardized board update summaries covering Revenue, Pipeline, Risks, Recommendations, Missing Data Notices, and Operational Health.

---

## 📂 Project Structure

```
Skylark-Monday-BI-Agent/
├── backend/
│   ├── models/
│   │   └── bi_models.py          # Pydantic data schemas & request/response types
│   ├── prompts/
│   │   └── bi_prompts.py         # System prompt templates & leadership update prompts
│   ├── routes/
│   │   └── bi_routes.py          # FastAPI REST endpoints (/api/metrics, /api/chat, etc.)
│   ├── services/
│   │   ├── bi_service.py         # Data normalization & BI metric calculations
│   │   ├── gemini_service.py     # Gemini AI reasoning & analytical fallback engine
│   │   └── monday_service.py     # Monday GraphQL query client with exponential retry
│   ├── utils/
│   │   ├── cleaners.py           # Currency, date, sector & duplicate sanitizers
│   │   └── logger.py             # Structured application logging
│   ├── config.py                 # Environment variables loader
│   ├── main.py                   # FastAPI server entry point
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChartsView.tsx        # Visual sector charts & comparison cards
│   │   │   ├── ChatInterface.tsx     # Animated chatbot UI with typing effects
│   │   │   ├── Header.tsx            # Header bar & live status badges
│   │   │   ├── LeadershipModal.tsx   # Executive summary briefing report
│   │   │   ├── MetricCards.tsx       # KPI metrics overview cards
│   │   │   ├── MondayConfigModal.tsx # Live board ID configuration modal
│   │   │   └── Sidebar.tsx           # Navigation sidebar & quick prompts
│   │   ├── services/
│   │   │   └── api.ts                # API client functions for FastAPI backend
│   │   ├── types/
│   │   │   └── bi.ts                 # TypeScript interfaces
│   │   ├── App.tsx                   # Main React app container
│   │   ├── index.css                 # Glassmorphism styling tokens & Tailwind
│   │   └── main.tsx                  # React DOM renderer
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example
├── DecisionLog.md
└── README.md
```

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Monday.com GraphQL API Credentials
MONDAY_API_KEY=your_monday_api_key_here
MONDAY_DEALS_BOARD_ID=your_deals_board_id_here
MONDAY_WORKORDER_BOARD_ID=your_workorder_board_id_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=8000
FRONTEND_URL=http://localhost:5173
```

---

## 🏃 Local Setup & Development

### **1. Backend (FastAPI)**

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend server will start at:* `http://localhost:8000`  
*Interactive API Docs (Swagger):* `http://localhost:8000/docs`

### **2. Frontend (React + Vite)**

```bash
cd frontend
npm install
npm run dev
```
*Frontend application will open at:* `http://localhost:5173`

---

## ☁️ Deployment Instructions

### **Backend -> Render**
1. Connect your repository to Render.
2. Select **Web Service**, environment **Python 3**.
3. **Build Command:** `pip install -r backend/requirements.txt`
4. **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables: `MONDAY_API_KEY`, `MONDAY_DEALS_BOARD_ID`, `MONDAY_WORKORDER_BOARD_ID`, `GEMINI_API_KEY`.

### **Frontend -> Vercel**
1. Import repository on Vercel.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Deploy!

---

## 📄 License
MIT License. Built for Skylark Enterprise Business Intelligence.
