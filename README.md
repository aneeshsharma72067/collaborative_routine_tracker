# # 📘 Collaborative Routine Tracker

A modern, real-time collaborative routine tracking app where users join a group and share their daily routine visually. Built with **Next.js**, **NestJS**, **PostgreSQL**, and a modern UI/UX theme.

---

<br>

# ## 🚀 Project Structure

```
/
├── collaborative_routine_frontend/   # Next.js App Router + Tailwind + Zustand
├── collaborative_routine_backend/    # NestJS Backend + TypeORM + Postgres
└── README.md                         # This file
```

---

<br>

# ## ✨ Features

### ✔ Single-Group Model

Every user belongs to exactly one group → simple, focused collaboration.

### ✔ Routine Sharing

Each user creates their own daily routine; all routines appear together in a **Routine Grid** so the group can stay in sync.

### ✔ Invite-Based Joining

Users join a group through invite codes that expire.

### ✔ Authentication

JWT authentication with refresh tokens & secure password hashing.

### ✔ Modern UI & Theme System

A complete token-driven design system for animations, typography, spacing, and colors.

### ✔ Activity Log (optional module)

Track events like user joined, routine updated, check-ins, etc.

---

<br>

# ## 🛠️ Tech Stack

### **Frontend (collaborative_routine_frontend)**

* **Next.js 14+ (App Router)**
* **React**
* **Tailwind CSS**
* **Framer Motion**
* **Zustand** for global state (auth/user)
* **Axios** (or custom client) for API calls
* **Custom Design Token System**

### **Backend (collaborative_routine_backend)**

* **NestJS**
* **TypeORM**
* **PostgreSQL**
* **@nestjs/config** for environment config
* **JWT Authentication**
* **Class-Validator / Class-Transformer**
* **Modular architecture:** Users, Auth, Groups, Routines, Activity, Health

---

<br>

# ## 🔧 Setup Instructions

---

# ### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/collaborative-routine.git
cd collaborative-routine
```

---

# ### 2️⃣ Environment Variables

Create `.env` files in both folders.

---

## 🔹 Backend (`/collaborative_routine_backend/.env`)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=collaborative_routine

JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d
REFRESH_SECRET=anothersecret
REFRESH_EXPIRES_IN=7d
```

---

## 🔹 Frontend (`/collaborative_routine_frontend/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

---

<br>

# ### 3️⃣ Start Backend (NestJS)

```bash
cd collaborative_routine_backend
npm install
npm run start:dev
```

Backend runs on **[http://localhost:3001](http://localhost:3001)** by default.

---

<br>

# ### 4️⃣ Start Frontend (Next.js)

```bash
cd collaborative_routine_frontend
npm install
npm run dev
```

Frontend runs on **[http://localhost:3000](http://localhost:3000)**.

---

<br>

# ## 📡 API Overview (Backend)

### **Auth**

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### **Group**

* `GET /api/me/group`
* `POST /api/group`
* `POST /api/group/join`
* `POST /api/group/invite`
* `GET /api/group/members`

### **Routine**

* `GET /api/me/routine?date=YYYY-MM-DD`
* `PUT /api/me/routine`
* `GET /api/group/routine?date=YYYY-MM-DD`

### **Activity (optional)**

* `GET /api/group/activity`

---

<br>

# ## 🗂️ Backend Architecture Overview

```
src/
├── auth/
├── users/
├── groups/
├── routines/
├── activity/
├── database/
├── config/
└── common/
```

### Key Concepts

* **ConfigModule** wraps `@nestjs/config`
* **DatabaseModule** initializes TypeORM using ConfigService
* **Entities**: User, Group, GroupMember, GroupInvite, RoutineBlock, ActivityLog
* **Strict DTO validation**
* **Consistent response format**
* **Relation-driven design for routines + groups**

---

<br>

# ## 🎨 Frontend Architecture Overview

```
src/
├── app/                # Next.js routes
├── components/         
├── features/           
├── stores/             # Zustand states
├── lib/                # API client
└── styles/             # Theme system
```

### Highlights

* Fully responsive modern SaaS UI
* Token-based styling system
* Animations using Framer Motion
* Auth handled with Zustand store
* RoutineGrid integrated into dashboard

---

<br>

# ## 🧪 Development Tips

### 🔥 Hot reload both servers

Start backend in one terminal:

```bash
npm run start:dev
```

Start frontend in another:

```bash
npm run dev
```

### 🛠 Migrations

If using TypeORM migrations:

```
npm run migration:generate
npm run migration:run
```

### 🐘 Postgres Docker Example

```
docker run --name routine-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

---

<br>

# ## 📌 Roadmap

### MVP

* [x] Auth (register/login)
* [x] Group creation + joining
* [x] Routine creation
* [x] Shared group routine board
* [x] Complete theme system

### Next Features

* [ ] Routine check-ins
* [ ] Streaks & progress analytics
* [ ] Activity log UI
* [ ] Push/email notifications
* [ ] Multiple routine templates
* [ ] Mobile app (React Native)

---

<br>

# ## 🤝 Contributing

PRs and feature ideas are welcome.
Create a new branch:

```bash
git checkout -b feature/my-feature
```

