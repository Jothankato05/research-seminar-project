# V-CTRIP Technical Implementation Guide
## Veritas Cyber Threat Reporting & Intelligence Platform
### Detailed Personal Reference

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Authentication System Deep Dive](#2-authentication-system-deep-dive)
3. [Authorization & RBAC Implementation](#3-authorization--rbac-implementation)
4. [Report Management System](#4-report-management-system)
5. [File Upload & Evidence Handling](#5-file-upload--evidence-handling)
6. [Analytics Engine](#6-analytics-engine)
7. [Intelligence Database](#7-intelligence-database)
8. [Administration Module](#8-administration-module)
9. [Security Apparatus](#9-security-apparatus)
10. [Database Schema Design](#10-database-schema-design)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Research Seminar Justification](#12-research-seminar-justification)

---

## 1. System Architecture

### Technology Stack
```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  React 18 + TypeScript + TailwindCSS + Chart.js + React Router          │
│  Port: 5173                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                              BACKEND                                     │
│  NestJS + TypeScript + Prisma ORM + Passport.js + bcrypt                │
│  Port: 3000                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                              DATABASE                                    │
│  PostgreSQL 15 + Prisma Client                                          │
│  Port: 5432                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                         OPTIONAL SERVICES                                │
│  Redis (Rate Limiting) - Port: 6379                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
RESEARCH SEMINAR PROJECT/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── reports/        # Report management
│   │   ├── analytics/      # Statistics engine
│   │   ├── admin/          # Admin functions
│   │   ├── audit/          # Audit logging
│   │   ├── notifications/  # User notifications
│   │   └── common/         # Shared utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── secrets/
│       ├── private.key     # RS256 private key
│       └── public.key      # RS256 public key
├── frontend/
│   └── src/
│       ├── pages/          # Route components
│       ├── components/     # Reusable UI
│       └── context/        # React context (auth)
└── docker-compose.yml      # Container orchestration
```

---

## 2. Authentication System Deep Dive

### 2.1 Password Hashing (bcrypt)

**Location**: `backend/src/auth/auth.service.ts`

```typescript
// How password hashing works:
const salt = await bcrypt.genSalt();  // Generates random salt
const passwordHash = await bcrypt.hash(password, salt);  // Creates hash

// Verification during login:
const isMatch = await bcrypt.compare(password, user.passwordHash);
```

**Why bcrypt?**
- Adaptive: Can increase work factor as hardware improves
- Built-in salt: Prevents rainbow table attacks
- Slow by design: Makes brute-force impractical

### 2.2 JWT Token System (RS256)

**Location**: `backend/src/auth/auth.module.ts`

```typescript
JwtModule.register({
    privateKey: privateKey,     // Used to SIGN tokens (kept secret)
    publicKey: publicKey,       // Used to VERIFY tokens (can be shared)
    signOptions: { 
        expiresIn: '15m',       // Short-lived for security
        algorithm: 'RS256'      // Asymmetric algorithm
    },
})
```

**Why RS256 over HS256?**
| HS256 (Symmetric) | RS256 (Asymmetric) |
|-------------------|-------------------|
| Same key signs & verifies | Different keys for signing vs verifying |
| Key must be kept secret everywhere | Only private key needs protection |
| Simpler but less secure | Better for microservices |

**Token Payload Structure**:
```json
{
  "sub": "user-uuid-here",      // User ID
  "username": "user@email.com", // Email
  "role": "SECURITY",           // User role
  "iat": 1705234567,            // Issued at
  "exp": 1705235467             // Expires (15 min later)
}
```

### 2.3 Refresh Token Flow

**Location**: `backend/src/auth/auth.service.ts`

```
1. User logs in → Gets access_token (15 min) + refresh_token (7 days)
2. Access token expires → Client sends refresh_token
3. Server validates refresh_token hash in database
4. New access_token + refresh_token issued
5. Old refresh_token invalidated (rotation)
```

**Security Benefit**: Limits damage if access token is stolen (only 15 minutes validity).

### 2.4 Brute-Force Protection

**Location**: `backend/src/auth/auth.service.ts`

```typescript
if (isMatch) {
    // Reset on successful login
    await this.prisma.user.update({
        data: { failedLoginAttempts: 0 },
    });
} else {
    const attempts = user.failedLoginAttempts + 1;
    const isLocked = attempts >= 5;  // Lock threshold
    
    await this.prisma.user.update({
        data: {
            failedLoginAttempts: attempts,
            isLocked: isLocked
        },
    });
}
```

**Login Flow with Lockout**:
```
Attempt 1-4: "Invalid credentials" error
Attempt 5: Account locked
Attempt 6+: "Account is locked" error (even with correct password)
Admin must manually unlock via Admin Dashboard
```

---

## 3. Authorization & RBAC Implementation

### 3.1 Role Definitions

**Location**: `backend/prisma/schema.prisma`

```prisma
enum UserRole {
  STUDENT   // Basic user - can submit reports
  STAFF     // University staff - can update report status
  ADMIN     // Full access - user management + audit logs
  SECURITY  // Security team - analyst dashboard access
}
```

### 3.2 Roles Guard Implementation

**Location**: `backend/src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get required roles from decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (!requiredRoles) return true;  // No roles specified = allow all
        
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.role === role);
    }
}
```

### 3.3 How to Protect an Endpoint

**Example from**: `backend/src/admin/admin.controller.ts`

```typescript
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)  // First verify JWT, then check role
@Roles(UserRole.ADMIN)                     // Only ADMIN can access
export class AdminController {
    @Get('users')
    async getUsers() { ... }
}
```

### 3.4 Role-Based UI Rendering

**Location**: `frontend/src/components/Layout.tsx`

```typescript
// Navigation items shown based on role
{user?.role === 'ADMIN' && (
    <Link to="/admin">Admin Dashboard</Link>
)}
{['ADMIN', 'SECURITY', 'STAFF'].includes(user?.role) && (
    <Link to="/analyst">Analyst Dashboard</Link>
)}
```

---

## 4. Report Management System

### 4.1 Report Lifecycle

```
┌─────────┐    Investigate    ┌──────────────┐    Resolve    ┌──────────┐
│  OPEN   │ ────────────────► │ INVESTIGATING │ ────────────► │ RESOLVED │
└─────────┘                   └──────────────┘               └──────────┘
                                     │
                                     │ Dismiss
                                     ▼
                              ┌───────────┐
                              │ DISMISSED │
                              └───────────┘
```

### 4.2 Report Data Model

**Location**: `backend/prisma/schema.prisma`

```prisma
model Report {
  id          String         @id @default(uuid())
  title       String
  description String
  type        ReportType     // PHISHING, MALWARE, HARASSMENT, DATA_LEAK, OTHER
  status      ReportStatus   @default(OPEN)
  priority    ReportPriority @default(LOW)
  isAnonymous Boolean        @default(false)
  
  authorId    String?        // Null if anonymous
  author      User?          @relation(fields: [authorId], references: [id])
  
  evidence    Evidence[]
  comments    Comment[]
  votes       Vote[]
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}
```

### 4.3 Anonymous Report Handling

**Location**: `backend/src/reports/reports.service.ts`

```typescript
// When creating report
data: {
    authorId: createReportDto.isAnonymous ? null : userId,
}

// When fetching reports
if (report.isAnonymous) {
    return { ...report, author: null, authorId: null };
}
```

**Security Principle**: Data minimization - don't store what you don't need.

### 4.4 Status Update Authorization

```typescript
async updateStatus(id: string, updateDto: UpdateReportStatusDto, userId: string, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF];
    if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenException('You do not have permission');
    }
    // ... update logic
}
```

---

## 5. File Upload & Evidence Handling

### 5.1 Security Controls

**Location**: `backend/src/reports/reports.controller.ts`

```typescript
// Allowed file types (whitelist approach)
const ALLOWED_FILE_TYPES = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|log|json|csv)$/i;

// Maximum file size
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Multer configuration
storage: diskStorage({
    destination: './uploads/evidence',
    filename: (req, file, callback) => {
        const uniqueSuffix = uuidv4();  // Random UUID prevents overwriting
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
    },
}),
fileFilter: (req, file, callback) => {
    if (!ALLOWED_FILE_TYPES.test(file.originalname)) {
        return callback(new BadRequestException('Invalid file type'), false);
    }
    callback(null, true);
},
```

### 5.2 Why These Controls Matter

| Control | Attack Prevented |
|---------|-----------------|
| File type whitelist | Executable upload (web shells) |
| Size limit | DoS via storage exhaustion |
| UUID filenames | Path traversal, file overwriting |
| Separate upload directory | Directory traversal attacks |

---

## 6. Analytics Engine

### 6.1 Statistics Generation

**Location**: `backend/src/analytics/analytics.service.ts`

```typescript
async getStats() {
    const [totalReports, byStatus, byType, byPriority] = await Promise.all([
        this.prisma.report.count(),
        this.prisma.report.groupBy({ by: ['status'], _count: true }),
        this.prisma.report.groupBy({ by: ['type'], _count: true }),
        this.prisma.report.groupBy({ by: ['priority'], _count: true }),
    ]);
    
    return { totalReports, reportsByStatus, reportsByType, reportsByPriority };
}
```

### 6.2 Frontend Visualization

**Location**: `frontend/src/pages/AnalyticsDashboard.tsx`

Uses Chart.js for:
- **Bar Chart**: Reports by threat type
- **Pie Chart**: Severity distribution
- **Summary Cards**: Status counts

---

## 7. Intelligence Database

### 7.1 Purpose

The Intelligence Database displays **RESOLVED** reports as verified incidents:

```typescript
// Fetches only resolved reports
const response = await axios.get('/reports?status=RESOLVED&limit=100');
```

### 7.2 Value Proposition
- Historical reference for similar future incidents
- Pattern recognition across multiple incidents
- Security awareness training material
- Evidence of security program effectiveness

---

## 8. Administration Module

### 8.1 User Management

**Location**: `backend/src/admin/admin.service.ts`

```typescript
async getUsers() {
    return this.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            isLocked: true,
            failedLoginAttempts: true,
            createdAt: true,
        },
    });
}

async toggleLock(userId: string, adminUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const newLockState = !user.isLocked;
    
    await this.prisma.user.update({
        where: { id: userId },
        data: { 
            isLocked: newLockState,
            failedLoginAttempts: 0  // Reset on manual toggle
        },
    });
    
    await this.auditService.log(adminUserId, 
        newLockState ? 'USER_LOCKED' : 'USER_UNLOCKED',
        `User ${userId} lock toggled`
    );
}
```

### 8.2 Audit Logging

**Location**: `backend/src/audit/audit.service.ts`

```typescript
async log(userId: string | null, action: string, details?: string, ip?: string, ua?: string) {
    await this.prisma.auditLog.create({
        data: {
            userId,
            action,        // e.g., LOGIN_SUCCESS, REPORT_CREATED
            details,       // e.g., "Report abc123 status changed to RESOLVED"
            ipAddress: ip, // Client IP for forensics
            userAgent: ua, // Browser/device info
        },
    });
}
```

**Actions Logged**:
- `LOGIN_SUCCESS` / `LOGIN_LOCKED`
- `USER_REGISTER`
- `REPORT_CREATED`
- `REPORT_STATUS_UPDATED`
- `EVIDENCE_UPLOADED`
- `USER_LOCKED` / `USER_UNLOCKED`
- `ACCOUNT_LOCKED` (automatic after 5 failures)

---

## 9. Security Apparatus

### 9.1 HTTP Security Headers (Helmet.js)

**Location**: `backend/src/main.ts`

```typescript
app.use(helmet());
```

**Headers Applied**:
| Header | Protection |
|--------|-----------|
| `X-Content-Type-Options: nosniff` | MIME sniffing attacks |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking |
| `X-XSS-Protection: 1; mode=block` | Reflected XSS |
| `Strict-Transport-Security` | HTTPS downgrade attacks |
| `Content-Security-Policy` | XSS, code injection |

### 9.2 Input Validation

**Location**: `backend/src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Error on unknown properties
    transform: true,           // Auto-transform types
}));
```

**DTO Example**:
```typescript
class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}
```

### 9.3 Rate Limiting (Throttling)

**Location**: `backend/src/app.module.ts`

```typescript
ThrottlerModule.forRootAsync({
    useFactory: (config: ConfigService) => ({
        throttlers: [{
            ttl: 60000,  // 1 minute window
            limit: 100,  // 100 requests max
        }],
        storage: new ThrottlerStorageRedisService(config),
    }),
})
```

**Endpoint-Specific Limits**:
```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } })  // 10 reports/minute
async create() { ... }

@Throttle({ default: { limit: 5, ttl: 60000 } })   // 5 uploads/minute
async uploadEvidence() { ... }
```

### 9.4 CORS Configuration

```typescript
app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,  // Allow cookies/auth headers
});
```

**Security Principle**: Only specified origins can make requests - prevents malicious sites from making authenticated requests on behalf of users.

### 9.5 CSRF Protection (Production)

```typescript
// Disabled for development; enable in production:
if (process.env.NODE_ENV === 'production') {
    app.use(csurf({ cookie: true }));
}
```

---

## 10. Database Schema Design

### 10.1 Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │──────<│  Report  │>──────│ Evidence │
└──────────┘       └──────────┘       └──────────┘
     │                  │
     │                  │
     ▼                  ▼
┌──────────┐       ┌──────────┐
│ AuditLog │       │ Comment  │
└──────────┘       └──────────┘
                        │
                        ▼
                   ┌──────────┐
                   │   Vote   │
                   └──────────┘
```

### 10.2 Security-Focused Design Decisions

| Decision | Reason |
|----------|--------|
| UUID primary keys | Prevents enumeration attacks |
| Separate passwordHash field | Never expose in API responses |
| authorId nullable | Supports anonymous reports |
| Cascading deletes on Evidence | Data consistency |
| Indexes on status, priority, createdAt | Query performance |

---

## 11. API Endpoints Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Get tokens |
| POST | `/api/v1/auth/refresh` | JWT | Refresh tokens |
| POST | `/api/v1/auth/logout` | JWT | Invalidate tokens |

### Reports
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/reports` | JWT | Create report |
| GET | `/api/v1/reports` | Public | List reports |
| GET | `/api/v1/reports/:id` | Public | Get report details |
| PATCH | `/api/v1/reports/:id/status` | STAFF+ | Update status |
| POST | `/api/v1/reports/:id/evidence` | JWT | Upload file |
| POST | `/api/v1/reports/:id/comments` | JWT | Add comment |
| POST | `/api/v1/reports/:id/vote` | JWT | Vote on report |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/admin/users` | ADMIN | List users |
| PATCH | `/api/v1/admin/users/:id/lock` | ADMIN | Toggle lock |
| GET | `/api/v1/admin/audit-logs` | ADMIN | View audit logs |

### Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/analytics` | Public | Get statistics |

---

## 12. Research Seminar Justification

### Why V-CTRIP is a Suitable Cybersecurity Research Project

#### 12.1 Demonstrates Defense in Depth

The platform implements multiple layers of security:

```
Layer 1: Network     → CORS, Rate Limiting
Layer 2: Transport   → HTTPS (in production)
Layer 3: Application → Input Validation, Helmet Headers
Layer 4: Authentication → JWT with RS256, bcrypt
Layer 5: Authorization → RBAC with Guards
Layer 6: Data         → Parameterized queries (Prisma)
Layer 7: Audit        → Complete action logging
```

#### 12.2 Covers OWASP Top 10 Mitigations

| OWASP Vulnerability | V-CTRIP Mitigation |
|--------------------|-------------------|
| A01: Broken Access Control | RBAC Guards, JWT validation |
| A02: Cryptographic Failures | bcrypt, RS256, secure defaults |
| A03: Injection | Prisma parameterized queries |
| A04: Insecure Design | Threat modeling, secure architecture |
| A05: Security Misconfiguration | Helmet.js, validation pipes |
| A06: Vulnerable Components | Regular npm updates |
| A07: Auth Failures | Account lockout, token rotation |
| A08: Data Integrity Failures | Input validation, whitelisting |
| A09: Logging Failures | Complete audit trail |
| A10: SSRF | File upload restrictions |

#### 12.3 Industry Alignment

The project uses technologies and patterns found in enterprise environments:
- **NestJS**: Used by companies like Adidas, Autodesk
- **PostgreSQL**: Industry-standard relational database
- **JWT + RBAC**: Standard enterprise authentication pattern
- **Audit Logging**: Required for SOC 2, ISO 27001 compliance

#### 12.4 Extensibility Roadmap

The platform can be enhanced with:
- Two-Factor Authentication (2FA)
- SIEM integration for centralized logging
- Email notifications for report updates
- Machine learning for threat classification
- Mobile application
- SSO integration (SAML, OAuth)

#### 12.5 Educational Value

A student studying this project learns:
1. Secure coding practices
2. Authentication mechanisms
3. Authorization patterns
4. Database security
5. API security
6. Incident response workflows
7. Compliance requirements

---

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run start:dev

# Start frontend
cd frontend && npm run dev

# Create/update database
cd backend && npx prisma db push

# Seed demo users
cd backend && npx ts-node prisma/seed-demo.ts

# Generate Prisma client
cd backend && npx prisma generate
```

---

*Detailed Implementation Guide - Personal Reference Document*
