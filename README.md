# 🏥 NZ-HIS — Hospital Information System

AI-powered Hospital Information System designed for New Zealand hospitals. Built with modern web technologies and compliant with NZ health information standards.

![NZ-HIS Dashboard](https://img.shields.io/badge/FHIR-R4-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Modules
- **🏥 Patient Management** — NHI-based patient registry with NZ demographics (Māori, Pacific Islander, etc.)
- **📋 Clinical EMR** — SOAP notes, clinical timeline, AI-assisted documentation
- **📅 Appointments** — Scheduling with department and provider management
- **⏳ Waitlist Management** — Priority-based surgical waitlist (NZ public hospital core feature)
- **🤖 AI Clinical Assistant** — Natural language queries for clinical data
- **📊 Dashboard** — Real-time hospital operations overview

### NZ-Specific Features
- **NHI (National Health Index)** number integration
- **ACC (Accident Compensation Corporation)** claim tracking
- **Māori/Pacific Islander** ethnicity and iwi tracking
- **Te Whatu Ora** aligned data standards
- **FHIR R4** compliant REST API endpoints

### FHIR R4 API
- `GET /api/fhir/Patient` — Patient resources
- `GET /api/fhir/Encounter` — Encounter resources
- `GET /api/fhir/Observation` — Observation resources (labs & vitals)

## 🛠 Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js with role-based access control
- **AI:** Mock AI clinical assistant (extensible to OpenAI/Claude)
- **Deployment:** Vercel

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/nz-his-system.git
cd nz-his-system

# Install
npm install

# Setup database
npx prisma db push
npx tsx prisma/seed.ts

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nzhis.co.nz | demo123 |
| Doctor | doctor@nzhis.co.nz | demo123 |
| Nurse | nurse@nzhis.co.nz | demo123 |
| Receptionist | reception@nzhis.co.nz | demo123 |

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/      # Authenticated pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── patients/      # Patient management
│   │   ├── clinical/      # Clinical EMR
│   │   ├── appointments/  # Appointments
│   │   ├── waitlist/      # Waitlist management
│   │   └── ai-agent/      # AI assistant
│   ├── api/               # API routes
│   │   ├── fhir/          # FHIR R4 endpoints
│   │   ├── patients/      # Patient CRUD
│   │   ├── ai/            # AI agent
│   │   └── dashboard/     # Dashboard stats
│   └── login/             # Auth page
├── components/            # UI components
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## 📸 Screenshots

*Coming soon*

## 📜 License

MIT

---

Built with ❤️ for New Zealand healthcare · Te Whatu Ora · FHIR R4 Compliant
