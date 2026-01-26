Welcome to the **Veritas Cyber Threat Reporting & Intelligence Platform (V-CTRIP)**. This document is designed to get you up and running in 5 minutes and provide you with the technical depth needed to defend this project during a presentation.

---

## 1. The Core Mission: What Problem is V-CTRIP Solving?

In many institutions (like universities), cyber threat reporting is often **fragmented, slow, and intimidating**. V-CTRIP solves these 4 critical industry problems:

1.  **The "Fear Factor" (Reporting Gap)**: Many users see phishing or malware but don't report it because they fear being blamed. **V-CTRIP's Anonymous Reporting** builds trust and increases the "eyes on the ground."
2.  **Fragmented Communication**: Using emails or phone calls for security leads to data loss. V-CTRIP provides a **Centralized Command Center** where every incident has a permanent record and a status (Open, Investigating, Resolved).
3.  **Lack of Historical Intelligence**: Organizations often "forget" old attacks. Our **Intelligence Database** turns past incidents into a searchable knowledge base so the team can prevent history from repeating itself.
4.  **The "Who Did What?" Problem**: In high-security environments, accountability is king. Our **Automated Audit Logs** ensure that every action taken by an analyst or admin is recorded for forensic verification.

---

## 2. The "5-Minute" Quick Start

### **Prerequisites**
- **Node.js** (v18 or higher)
- **PostgreSQL** (Installed and running)

### **Step 1: Database Setup**
1. Open your PostgreSQL tool (like pgAdmin or terminal).
2. Create a database named `vctrip`.
3. Update `backend/.env` with your password:
   `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vctrip`

### **Step 2: Start the Backend (Terminal 1)**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push             # Creates the tables
npx ts-node prisma/seed-demo.ts # Creates test accounts
npm run start:dev               # Application starts on port 3000
```

### **Step 3: Start the Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev                     # Application starts on port 5173
```

---

## 🛠 2. Technical Architecture (The "How it Works")

### **The Stack**
- **Frontend**: React 18 + Vite (for speed) + TailwindCSS (for modern UI).
- **Backend**: NestJS (Enterprise-grade Node.js framework).
- **ORM**: Prisma (Ensures type-safe database queries).
- **Database**: PostgreSQL (Relational data for complex reporting).

### **Security Implementation (Your Best Defense)**
If asked about security, mention these 4 pillars:
1. **JWT RS256**: We use **Asymmetric Encryption**. The backend signs tokens with a private key, and verifies them with a public key. This is more secure than standard HS256 strings.
2. **RBAC (Role-Based Access Control)**: Different users (Student, Staff, Analyst, Admin) have strictly partitioned permissions.
3. **Bcrypt**: Passwords are never stored as text; they are "salted and hashed" using adaptive rounds.
4. **Audit Logs**: Every critical action (login failure, report submission, user locking) is recorded in a permanent `AuditLog` table for forensic analysis.

---

## 4. Defense Strategy: Q&A Preparation

**Q1: Why did you choose NestJS instead of simple Express?**  
> *Answer:* NestJS provides a modular architecture that is easier to scale and maintain. It uses TypeScript by default and enforces a "Controller-Service" pattern, making the code cleaner and more testable.

**Q2: How do you protect against SQL Injection?**  
> *Answer:* We use **Prisma ORM**. Prisma uses parameterized queries under the hood, making it mathematically impossible for malicious users to inject SQL commands into our input fields.

**Q3: How is the "Anonymous" reporting handled?**  
> *Answer:* When a user checks the "Anonymous" box, the system still tracks the `authorId` for database integrity, but the frontend filters all identity data so Analysts see it as "Anonymous User" unless they have Admin-level clearance.

**Q4: Is the platform scalable?**  
> *Answer:* Yes. The frontend and backend are completely decoupled. We can host them on separate servers, use a Load Balancer for the API, and connect to a managed Database cluster in production.

---

## Demo Credentials (Seeded Data)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@veritas.edu` | `Password123!` |
| **Student** | `student@veritas.edu` | `Password123!` |
| **Analyst** | `security@veritas.edu` | `Password123!` |

---

**Built with ❤️ for the Veritas Research Seminar.**
