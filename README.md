# SLNSVM - Sri Laxmi Narayan Saraswati Vidya Mandir

A comprehensive school management system for Sri Laxmi Narayan Saraswati Vidya Mandir, Bhagwanpur, Vaishali, Bihar.

Built with Next.js 14, FastAPI, and PostgreSQL.

## School Information

- **Name**: श्री लक्ष्मी नारायण सरस्वती विद्या मंदिर (Sri Laxmi Narayan Saraswati Vidya Mandir)
- **Location**: Bhagwanpur, Vaishali, Bihar - 844114
- **Motto**: विद्या ददाति विनयम् (Knowledge gives humility)
- **Contact**:
  - Principal: +91 9430218068
  - Chairman: +91 8292177298
  - Email: slnsvman1998@gmail.com

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+, SQLAlchemy |
| Database | PostgreSQL |
| Cache | Redis |
| AI | OpenAI GPT-4 |
| Auth | JWT + OAuth2 |
| i18n | next-intl (Hindi & English) |

## Project Structure

```
slnsvm/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── [locale]/        # Internationalized routes
│   │   │   ├── (public)/    # Public pages (home, about, admissions)
│   │   │   ├── student/     # Student portal
│   │   │   ├── parent/      # Parent portal
│   │   │   ├── teacher/     # Teacher portal
│   │   │   └── admin/       # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   └── features/        # Feature-specific components
│   ├── lib/                 # Utilities (api, auth)
│   ├── messages/            # i18n translations (en.json, hi.json)
│   └── public/              # Static assets
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config, security, database
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── ai/              # AI/LangGraph agents
│   │   └── seed_data.py     # Database seeding script
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR for local development:
  - Node.js 20+
  - Python 3.11+
  - PostgreSQL 15+
  - Redis

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/slnsvm.git
cd slnsvm

# 2. Start all services
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Step 1: Setup PostgreSQL & Redis

```bash
# Using Docker for databases only
docker run -d --name slnsvm-postgres \
  -e POSTGRES_USER=slnsvm \
  -e POSTGRES_PASSWORD=slnsvm123 \
  -e POSTGRES_DB=slnsvm_db \
  -p 5432:5432 \
  postgres:15

docker run -d --name slnsvm-redis \
  -p 6379:6379 \
  redis:7
```

#### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Step 3: Setup Frontend

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the development server
npm run dev -- -p 9000
```

#### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:9000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

## Database Seeding

The project includes a comprehensive seed data script with Bihar-specific school data.

### Seed Data Includes

- 1 Admin user
- 12 Teachers with qualifications
- 22 Classes (Nursery to Class 12)
- 100+ Subjects
- 400+ Students with Bihar names
- 400+ Parents
- Complete timetable
- Notices in Hindi
- Exams and schedules
- Fee records
- Attendance records
- Assignments

### Running Seed Data

#### Method 1: Command Line (Recommended)

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run seed script
python -m app.seed_data

# To force re-seed (clears existing data):
python -m app.seed_data --force
```

#### Method 2: Environment Variable

Set in `backend/.env`:
```env
SEED_DATA_ENABLED=true
SEED_DATA_FORCE=false  # Set to true to clear and re-seed
```

Then restart the backend server. Seeding will run automatically on startup.

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@slnsvm.edu | admin123 |
| Teacher | rajesh.singh@slnsvm.edu | teacher123 |
| Parent | parent1@example.com | parent123 |
| Student | student1@slnsvm.edu | student123 |

## Features

### Public Website
- Bilingual support (Hindi/English)
- Home page with hero, features, announcements
- About School page
- Academics & Curriculum page
- Admissions page with inquiry form
- Faculty page
- Facilities page
- Gallery page
- Contact page with Google Maps
- AI-powered chatbot for FAQs

### Student Portal
- Dashboard with attendance, assignments overview
- Timetable viewer
- Assignments & homework submission
- Exam schedule & results
- Attendance view
- Notices

### Parent Portal
- Children progress tracking
- Attendance monitoring
- Fee payment & history (Razorpay integration)
- School announcements
- Communication with teachers

### Teacher Portal
- Class management
- Assignment creation & evaluation
- Attendance marking
- Marks entry
- AI-powered question paper generation

### Admin Dashboard
- Student management (CRUD + bulk import)
- Teacher management
- Fee management system
- Admission management
- Notice board management
- Reports and analytics

## API Endpoints

### Authentication
```
POST /api/v1/auth/login          # User login
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/refresh        # Refresh token
GET  /api/v1/auth/me             # Get current user
POST /api/v1/auth/logout         # Logout
```

### Students
```
GET  /api/v1/students/dashboard  # Dashboard data
GET  /api/v1/students/timetable  # Get timetable
GET  /api/v1/students/assignments # Get assignments
GET  /api/v1/students/attendance  # Get attendance
GET  /api/v1/students/results     # Get exam results
GET  /api/v1/students/notices     # Get notices
```

### Parents
```
GET  /api/v1/parents/dashboard   # Dashboard data
GET  /api/v1/parents/children    # Get children info
GET  /api/v1/parents/fees        # Get fee details
POST /api/v1/parents/fees/pay    # Initiate payment
```

### Teachers
```
GET  /api/v1/teachers/dashboard  # Dashboard data
GET  /api/v1/teachers/classes    # Get assigned classes
POST /api/v1/teachers/assignments # Create assignment
POST /api/v1/teachers/attendance  # Mark attendance
POST /api/v1/teachers/marks       # Enter marks
```

### Admin
```
GET  /api/v1/admin/dashboard     # Dashboard statistics
CRUD /api/v1/admin/students      # Student management
CRUD /api/v1/admin/teachers      # Teacher management
CRUD /api/v1/admin/fees          # Fee management
CRUD /api/v1/admin/notices       # Notice management
CRUD /api/v1/admin/admissions    # Admission management
POST /api/v1/admin/bulk/students # Bulk import students
```

### AI
```
POST /api/v1/ai/chat             # AI chatbot
POST /api/v1/ai/generate-questions # Generate exam questions
```

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://slnsvm:slnsvm123@localhost:5432/slnsvm_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=8000
HOST=0.0.0.0
DEBUG=true

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@slnsvm.edu

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Seed Data
SEED_DATA_ENABLED=false
SEED_DATA_FORCE=false
```

### Frontend (`frontend/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:9000
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| users | User authentication (email, password, role) |
| students | Student profiles with admission details |
| parents | Parent/guardian information |
| teachers | Teacher profiles and qualifications |
| admins | Admin users |
| classes | Class/section information |
| subjects | Subject details per class |
| timetable | Weekly class schedule |

### Academic Tables

| Table | Description |
|-------|-------------|
| assignments | Homework and assignments |
| assignment_submissions | Student submissions |
| exams | Examination details |
| exam_schedules | Exam date-wise schedule |
| exam_results | Student marks and grades |
| attendance | Daily attendance records |

### Administrative Tables

| Table | Description |
|-------|-------------|
| fees | Fee records and payments |
| notices | School announcements |
| admissions | Admission applications |

## Scripts

### Backend

```bash
# Run server
uvicorn app.main:app --reload --port 8000

# Run with specific host
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Seed database
python -m app.seed_data

# Force re-seed
python -m app.seed_data --force
```

### Frontend

```bash
# Development server
npm run dev

# Development on specific port
npm run dev -- -p 9000

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Deployment

### Production Build

```bash
# Backend
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Frontend
cd frontend
npm run build
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

**1. Database connection error**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U slnsvm -d slnsvm_db
```

**2. Redis connection error**
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

**3. Module not found error (Backend)**
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Run with module flag
python -m app.seed_data
```

**4. Port already in use**
```bash
# Find process using port
lsof -i :8000
lsof -i :9000

# Kill process
kill -9 <PID>
```

**5. Next.js locale error**
```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email slnsvman1998@gmail.com or call +91 9430218068.

---

**श्री लक्ष्मी नारायण सरस्वती विद्या मंदिर**
*विद्या ददाति विनयम्*
