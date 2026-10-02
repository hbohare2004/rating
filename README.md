# StoreRate — Store Rating Platform

A full-stack web application for discovering, reviewing, and rating stores, built with role-based access control for **System Administrators**, **Normal Users**, and **Store Owners**.

---

## 🚀 Tech Stack

### Frontend
- **React.js** (v18)
- **Vite**
- **Tailwind CSS** (v3)
- **React Router** (v6)
- **Axios**
- **Lucide React** (Icons)

### Backend
- **Node.js** & **Express.js**
- **Prisma ORM**
- **MySQL**
- **JWT Authentication** (`jsonwebtoken`)
- **Password Hashing** (`bcryptjs`)

---

## 🔑 Key Features

### 1. Authentication & Authorization
- Single unified login interface with role-based dashboard redirection (`ADMIN`, `USER`, `STORE_OWNER`).
- User registration with strict frontend and backend validation.
- Secure password change for all authenticated roles.
- Role-based route protection on both backend middleware (`authenticateToken`, `authorizeRole`) and React router (`ProtectedRoute`).

### 2. System Administrator
- **Platform Analytics Dashboard**: Live metric counters for total platform users, stores, and ratings.
- **Store Management**: Create stores, assign them to store owners, search and sort by store name, email, address, and computed overall rating.
- **User Management**: Create any role (`ADMIN`, `USER`, `STORE_OWNER`), filter by role, search, sort, and inspect user details (including store owner performance and store ratings).

### 3. Normal Users
- **Store Discovery**: Browse all registered stores with addresses, average ratings, and own submitted rating.
- **Interactive Ratings**: Submit 1 to 5 star ratings with an intuitive star interface.
- **Modify Ratings**: Users can modify their existing rating anytime. Enforced by database unique constraint (`userId + storeId`).
- **My Ratings**: Dedicated dashboard to track all personal submitted reviews.
- **Search**: Fast, responsive search by store name and address.

### 4. Store Owners
- **Store Analytics Dashboard**: View average star ratings (e.g. `4.6 / 5` with star icons) and rating distribution breakdown (1–5 stars).
- **Customer Feedback List**: View details of customers who rated their store (Name, Email, Rating, Date).
- **All Reviews View**: Filter and search through all customer feedback across stores.

---

## 🔒 Form Validation Rules

- **Name**: Minimum 20 characters, maximum 60 characters.
- **Email**: Standard email format validation.
- **Password**: 8–16 characters, at least 1 uppercase letter, at least 1 special character.
- **Address**: Maximum 400 characters.
- **Rating**: Integer from 1 to 5.

---

## 📁 Project Structure

```text
Rating/
├── client/
│   ├── src/
│   │   ├── components/       # StarRating, StateDisplays, ProtectedRoute
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── layouts/          # DashboardLayout (Sidebar & TopBar)
│   │   ├── pages/
│   │   │   ├── admin/        # AdminDashboard, Stores, Users, AddStore, AddUser
│   │   │   ├── auth/         # LoginPage, RegisterPage
│   │   │   ├── common/       # ProfilePage, ChangePasswordPage
│   │   │   ├── owner/        # OwnerDashboardPage, OwnerRatingsPage
│   │   │   └── user/         # UserStoresPage, UserMyRatingsPage, RatingModal
│   │   ├── services/         # Axios instance and API endpoints
│   │   ├── utils/            # Client-side validators
│   │   ├── App.jsx           # Application Router
│   │   ├── main.jsx          # Root rendering with providers
│   │   └── index.css         # Tailwind & styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma     # Relational schema (User, Store, Rating)
│   │   └── seed.js           # Database seeder with sample accounts
│   ├── src/
│   │   ├── controllers/      # auth, admin, store, rating, storeOwner
│   │   ├── middleware/       # authenticateToken, authorizeRole, errorHandler
│   │   ├── routes/           # REST API routes
│   │   ├── utils/            # Prisma singleton, response helpers
│   │   ├── validators/       # Backend validation rules
│   │   └── app.js            # Express server initialization
│   ├── .env.example
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### User
- `id` (Int, PK, Auto-increment)
- `name` (VarChar 60)
- `email` (VarChar 255, Unique)
- `password` (VarChar 255)
- `address` (VarChar 400)
- `role` (Enum: `ADMIN`, `USER`, `STORE_OWNER`)
- `createdAt`, `updatedAt`

### Store
- `id` (Int, PK, Auto-increment)
- `name` (VarChar 60)
- `email` (VarChar 255)
- `address` (VarChar 400)
- `ownerId` (Int, FK -> User.id)
- `createdAt`, `updatedAt`

### Rating
- `id` (Int, PK, Auto-increment)
- `rating` (SmallInt: 1–5)
- `userId` (Int, FK -> User.id)
- `storeId` (Int, FK -> Store.id)
- `createdAt`, `updatedAt`
- **Unique Constraint**: `@@unique([userId, storeId])` ensures 1 rating per user/store.

---

## 👥 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@example.com` | `Admin@123` |
| **Normal User** | `user@example.com` | `User@123` |
| **Store Owner** | `owner@example.com` | `Owner@123` |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL Server** running locally

### 2. Configure Environment Variables
Inside the `server/` directory, create or verify `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/store_rating_db"
JWT_SECRET="your_secure_jwt_secret_key"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 3. Setup Database & Seed Data

```bash
cd server
npm install

# Run database migrations and generate Prisma Client
npx prisma migrate dev --name init

# Seed database with demo accounts and stores
npm run seed
```

### 4. Run Backend Server

```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

### 5. Run Frontend Application

In a separate terminal:

```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /register` — Register normal user
- `POST /login` — Login user & return JWT
- `POST /change-password` — Change password (Auth required)
- `GET /me` — Get profile info (Auth required)

### Admin (`/api/admin`) *(Requires `ADMIN` role)*
- `GET /dashboard` — Metric counts (users, stores, ratings)
- `GET /users` — List users with search, role filter, sort, pagination
- `GET /users/:id` — User details with store owner stats
- `POST /users` — Create user (any role)
- `GET /stores` — List stores with search, sort, pagination
- `POST /stores` — Create store and assign to owner
- `GET /store-owners` — List store owners for dropdown

### Stores (`/api/stores`) *(Auth required)*
- `GET /` — List stores with computed rating and current user's rating
- `GET /:id` — Get store details by ID

### Ratings (`/api/ratings`)
- `POST /` — Submit rating (Requires `USER` role)
- `PUT /:id` — Update rating (Requires `USER` role)
- `GET /store/:storeId` — Get store ratings

### Store Owner (`/api/store-owner`) *(Requires `STORE_OWNER` role)*
- `GET /dashboard` — Store performance metrics, distribution, customer ratings
- `GET /ratings` — List all reviews across owned stores
