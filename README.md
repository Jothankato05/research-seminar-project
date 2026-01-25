# V-CTRIP: Veritas Cyber Threat Reporting & Intelligence Platform

V-CTRIP is a comprehensive web-based platform designed for reporting, tracking, and analyzing cyber threats. Built with a focus on defense-in-depth and modern security practices, it serves as a central hub for threat intelligence and incident management.

## 🚀 Features

- **Anonymous Threat Reporting**: Safely report incidents with optional anonymity.
- **Incident Lifecycle Management**: Track reports from Open to Investigation and Resolution.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Students, Staff, Analysts (Security), and Admins.
- **Real-time Analytics**: Visualize threat patterns and statistics via a dedicated dashboard.
- **Intelligence Database**: Access verified and resolved incidents for historical reference.
- **Advanced Security**: Implements JWT (RS256), bcrypt hashing, rate limiting, and secure HTTP headers.
- **Audit Logging**: Comprehensive tracking of all critical system actions for forensic purposes.

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **TailwindCSS** for styling
- **Chart.js** for analytics visualization
- **React Router** for navigation

### Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **Prisma ORM** for database management
- **Passport.js** for authentication
- **PostgreSQL** (Database)

## 📁 Project Structure

```text
RESEARCH SEMINAR PROJECT/
├── backend/            # NestJS application
│   ├── src/           # API source code
│   ├── prisma/        # Database schema & migrations
│   └── secrets/       # Security keys (RSA)
├── frontend/           # React application
│   └── src/           # UI source code
└── docker-compose.yml  # Container orchestration
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Npm or Yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd RESEARCH-SEMINAR-PROJECT
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Configure .env file with your DATABASE_URL
   # For local PostgreSQL: postgresql://postgres:YOUR_PASSWORD@localhost:5432/vctrip
   npx prisma generate
   npx prisma db push
   npx ts-node prisma/seed-demo.ts
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Configure .env file
   npm run dev
   ```

## 🚀 Deployment

The project is configured for easy deployment on **Render.com**:

1. **Backend**: Deploy as a *Web Service* using the `backend/Dockerfile` or the Node.js runtime. Ensure you add your `DATABASE_URL`, `JWT_PRIVATE_KEY`, and `JWT_PUBLIC_KEY` as environment variables.
2. **Frontend**: Deploy as a *Static Site*. Ensure you set `VITE_API_URL` to your backend URL.
3. **Database**: Use Render's managed PostgreSQL or Supabase.

Refer to `render.yaml` for infrastructure-as-code configuration.

## 🔒 Security Implementation

V-CTRIP follows the OWASP Top 10 mitigations and industry-standard security patterns:
- **Authentication**: JWT with RS256 asymmetric signing.
- **Password Security**: Adaptive bcrypt hashing with salt.
- **API Security**: Helmet.js, Rate Limiting, and CORS protection.
- **Data Protection**: Parameterized queries via Prisma to prevent SQL Injection.
- **Input Validation**: Global validation pipes for strict DTO checking.

## 📜 License

This project is developed as part of a Research Seminar. All rights reserved.
