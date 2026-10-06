# 🏥 Rehab360 AI — Next-Gen AI Sports Rehabilitation & Biomechanics Platform

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-0097A7?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E44AD?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Rehab360 AI** is a state-of-the-art, AI-powered digital sports rehabilitation and computer vision biomechanics platform. Built for **Athletes**, **Physiotherapists**, and **Orthopedic Surgeons**, Rehab360 AI bridges the gap between clinical biomechanics and daily rehabilitation using real-time browser pose estimation, AI-driven readiness scoring, dual synchronized video telemetry playback, and personalized prescription protocols.

---

## 🌟 Key Features & Role-Based Portals

### 🏃 1. Athlete Portal (`/athlete`)
- **Live Camera Computer Vision Tracking**: Real-time webcam exercise posture tracking, automatic rep counting, joint angle measurements, and form flaw detection powered by `@mediapipe/tasks-vision`.
- **AI Daily Readiness Index**: Algorithmic daily readiness scoring based on Sleep Quality, HRV (Heart Rate Variability), Muscle Soreness, RPE (Rate of Perceived Exertion), and historical workload.
- **Real-Time Telemetry Metrics**: Live calculation of Range of Motion (ROM), Angular Velocity, Symmetry Index, Ground Contact Time (GCT), Jump Height, and Fatigue Accumulation.
- **Customizable 2D/3D Avatars**: Personalized profile avatar selector with achievements, injury history badges, and progress milestones.
- **Strava-Inspired Telemetry Feed**: Activity logging, social performance sharing, and instant WhatsApp progress sharing.

### 🩺 2. Physiotherapist Dashboard (`/physio`)
- **Synchronized Dual-Video Telemetry Player**: Frame-by-frame dual video/canvas player overlaying joint angles, angular velocities, and landmark trajectories during patient exercise sessions.
- **Clinical Recovery Analytics**: Longitudinal movement velocity curves, symmetry deviation heatmaps, and AI-detected motion risk factors.
- **Patient Roster & Case Management**: Active patient tracking, compliance monitoring, and session review history.

### ⚕️ 3. Orthopedic Surgeon Dashboard (`/ortho`)
- **Pre/Post-Op Biomechanics Tracking**: Post-surgical joint kinematics, weight-bearing progression, and clinical recovery milestones.
- **Interactive Injury Taxonomy Explorer**: Visual anatomical breakdown of ligaments, tendons, and cartilage injuries (ACL, Meniscus, Achilles, Rotator Cuff, etc.) with stage-gated recovery criteria.
- **AI Exercise Drafter Modal**: Automated prescription drafter powered by Google Gemini AI, allowing surgeons to customize exercise intensity, sets, reps, and range-of-motion constraints.

---

## 🧠 Core Architecture & AI Engine

```
                          ┌───────────────────────────┐
                          │   Rehab360 Web App        │
                          │ (React 19 + Vite 8)       │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  MediaPipe Vision    │    │  Motion ML Engine    │    │  Google Gemini AI    │
│ (Pose/Hand Landmarks)│    │ (Kinematics & Reps)  │    │(Clinical Protocols)  │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

- **`motionMLEngine.js`**: Custom kinematic calculation engine evaluating vector angles (knee flexion, hip hinge, trunk tilt, ankle dorsiflexion), hysteresis-based rep detection state machines, angular velocity, and bilateral asymmetry indices.
- **`aiReadinessService.js`**: Multi-factorial readiness calculation model synthesizing subjective recovery scores and objective load metrics.
- **`geminiService.js`**: Google Gemini AI integration for automated clinical advice, workout protocol drafting, and patient summary generation.

---

## 🛠️ Tech Stack

- **Frontend Core**: React `19.2`, Vite `8.2`, React Router DOM `7.1`
- **Computer Vision & AI**: `@mediapipe/tasks-vision`, Custom Biomechanics ML Engine, Google Gemini API
- **Styling & Design System**: Modern Glassmorphism & Dark Mode UI with Vanilla CSS Design Tokens
- **Icons & Visuals**: Lucide React (`lucide-react`)
- **Backend & Database**: Supabase Client (`@supabase/supabase-js`), `@faker-js/faker` for telemetry simulation
- **Code Quality**: Oxlint (`oxlint`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/hari-learns-commits/REHAB-360.git
   cd REHAB-360
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📁 Directory Structure

```text
rehab360-app/
├── public/                  # Static assets & MediaPipe WASM binaries
├── src/
│   ├── assets/              # Branding & media assets
│   ├── components/          # Reusable UI components
│   │   ├── LiveCameraPoseTracker.jsx
│   │   ├── SynchronizedVideoTelemetryPlayer.jsx
│   │   ├── DoctorWorkoutDrafterModal.jsx
│   │   ├── InjuryTaxonomyModal.jsx
│   │   ├── ProfileAvatarSelector.jsx
│   │   ├── StravaMegaMenu.jsx
│   │   └── WhatsAppChat.jsx
│   ├── context/             # React Context providers (RehabDataContext)
│   ├── pages/               # Primary routes & dashboards
│   │   ├── LandingPage.jsx
│   │   ├── AthleteDashboard.jsx
│   │   ├── PhysioDashboard.jsx
│   │   └── OrthoDashboard.jsx
│   ├── services/            # AI & Biomechanics services
│   │   ├── motionMLEngine.js
│   │   ├── aiReadinessService.js
│   │   ├── geminiService.js
│   │   └── workoutPlanService.js
│   ├── App.jsx              # Application routing & layout
│   └── main.jsx             # React entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
