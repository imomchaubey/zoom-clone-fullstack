# 🌐 Enterprise-Grade Zoom Web Client Clone (Full-Stack SDE Assignment)

A production-ready, full-stack video conferencing platform meticulously engineered to replicate Zoom’s native user interface, user experience, and core meeting lifecycle workflows. Built with modern, high-performance web frameworks and a robust relational backend.

---

## 🏗️ System Architecture & Tech Stack
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 Client                    │
│     (App Router, Tailwind CSS, Client/Server Split)     │
└──────────────────────────┬─────────────────────────────┘
│ HTTP / REST / JSON
▼
┌────────────────────────────────────────────────────────┐
│                   Python FastAPI API                   │
│      (Pydantic Validation, CORS, Async Routing)        │
└──────────────────────────┬─────────────────────────────┘
│ SQLAlchemy ORM
▼
┌────────────────────────────────────────────────────────┐
│                  SQLite Relational DB                  │
│       (Users, Meetings, Participants, State Tracking)  │
└────────────────────────────────────────────────────────┘

### **Core Stack**
* **Frontend:** Next.js (App Router, React 18, Tailwind CSS, Component Modularization)
* **Backend:** Python, FastAPI, Pydantic v2, SQLAlchemy ORM
* **Database:** SQLite (Normalized relational schema optimized for meeting lifecycles)
* **Media Layer:** Browser-native `navigator.mediaDevices` Web API for hardware integration

---

## 📋 Comprehensive Feature Matrix

### 1. **Interactive Landing Dashboard**
* Professional, pixel-matched Zoom UI replica featuring a collapsible sidebar, dynamic header clock, and quick-action cards.
* Real-time rendering of **Upcoming Meetings** and **Recent Meetings** fetched directly from the relational database.

### 2. **Instant Meeting Orchestration**
* Generates cryptographically secure 11-digit meeting identifiers on demand.
* Instantly provisions meeting records, assigns host privileges, and redirects users to the live virtual environment with one click.

### 3. **Robust Join Workflow & Pre-Join Room**
* Secure meeting lookup routes that validate meeting existence before entry.
* Pre-join configuration screen integrating live hardware device enumeration (`getUserMedia`) for local camera and microphone stream previews.
* Dynamic state handling for audio/video mute preferences prior to room entry.

### 4. **Advanced Meeting Scheduling System**
* Comprehensive scheduling form supporting custom topic titles, descriptions, date/time pickers, and duration limits.
* Persistent database storage ensuring scheduled events instantly populate the user's upcoming agenda dashboard.

### 5. **Virtual Meeting Room & Host Controls**
* Dark-themed responsive participant grid layout.
* Interactive slide-out participant management panel.
* Enterprise host controls including global participant audio management ("Mute All") and dynamic participant removal.

---

## 🗄️ Database Schema Design

The persistence layer is structured around three core relational entities optimized via SQLAlchemy:

* **`Users` Table:** Stores profile metadata, unique identifiers, and avatar color accents for UI representation.
* **`Meetings` Table:** Handles session metadata, including unique 11-digit meeting codes, titles, descriptions, host foreign keys, meeting types (`instant` vs. `scheduled`), operational status (`scheduled`, `active`, `ended`), start timestamps, and duration.
* **`Participants` Table:** Manages junction relationships tracking who joined which meeting, their display names, role assignments (`host` vs. `participant`), and connection/disconnection timestamps.

---

## ⚙️ Architectural Decisions & Assumptions

1. **Authentication Bypassing:** In strict accordance with assignment guidelines prioritizing core functionality over boilerplate, full user authentication (OAuth/JWT) is bypassed. The application utilizes a seeded default host profile (`Om Prakash Chaubey`) to seamlessly drive meeting creation and management workflows.
2. **Media Routing Scope:** Real-time multi-user WebRTC peer-to-peer mesh routing and signaling servers require dedicated infrastructure scaling outside a standard 1-day evaluation timeline. The application instead implements robust local hardware device acquisition for the Pre-Join UX and polished, responsive state management inside the meeting room.
3. **Idempotent Database Seeding:** An automated startup sequence seeds the SQLite database with rich mock data (active hosts, upcoming conferences, and historical logs) to ensure a fully populated, interactive dashboard upon initial boot.

---

## 🚀 Local Installation & Quickstart

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm

### 1. Backend Setup (FastAPI)
Navigate to the backend directory, initialize your virtual environment, install dependencies, and launch the server:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*(The SQLite database and demo data seed script will initialize automatically upon server startup).*

### 2. Frontend Setup (Next.js)
Open a separate terminal instance, navigate to the frontend directory, install packages, and spin up the development environment:
```bash
cd frontend
npm install
npm run dev
```
Access the fully functional web application in your browser at:  
👉 **`http://localhost:3000`**