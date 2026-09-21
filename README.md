# Full Stack Library Management System

A full-stack Library Management System built to simplify book management, browsing, borrowing, and administration through a web-based application.

The project features a React frontend and a Node.js/Express backend, with PostgreSQL for persistent data storage and Drizzle ORM for database interactions. It also incorporates JWT-based authentication, Redis caching, and rate limiting.

## 🚀 Features

### 👤 User Features

* User registration and login.
* JWT-based authentication.
* Browse and explore available books.
* View book details and categories.
* Search and navigate the library catalog.
* View and manage user profile information.
* Review books and track borrowing activity.

### 🛠️ Admin Features

* Dedicated admin login and protected admin routes.
* Manage books in the library.
* Add, update, and delete book records.
* Manage book categories.
* Upload book images.
* Monitor and manage library-related records.

### ⚡ Backend & Performance

* RESTful API architecture using Node.js and Express.js.
* PostgreSQL database integration.
* Drizzle ORM for structured database queries and schema management.
* Zod-based request validation.
* JWT authentication and authorization middleware.
* Redis integration for caching.
* API rate limiting using `express-rate-limit` and Redis.
* In-memory rate-limiting fallback when Redis is unavailable.
* Environment-based configuration.
* Centralized backend route and middleware organization.

## 🧰 Tech Stack

| Category          | Technologies                         |
| ----------------- | ------------------------------------ |
| Frontend          | React.js, Vite, JavaScript, CSS      |
| Backend           | Node.js, Express.js                  |
| Database          | PostgreSQL                           |
| ORM               | Drizzle ORM                          |
| Authentication    | JSON Web Tokens (JWT), bcrypt        |
| Validation        | Zod                                  |
| Caching           | Redis, ioredis                       |
| Rate Limiting     | express-rate-limit, rate-limit-redis |
| API Communication | Axios                                |
| Development Tools | Git, GitHub, VS Code                 |

## 🏗️ Architecture

The application follows a client-server architecture.

```text
              ┌──────────────────────┐
              │      React UI        │
              │    React + Vite      │
              └──────────┬───────────┘
                         │
                    HTTP / Axios
                         │
              ┌──────────▼───────────┐
              │    Express Server    │
              │      Node.js         │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │ Routes & Middleware  │
              │ Authentication       │
              │ Authorization        │
              │ Request Validation   │
              │ Rate Limiting        │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │   Controllers        │
              │ Application Logic    │
              └──────┬────────┬──────┘
                     │        │
            ┌────────▼───┐  ┌─▼──────────┐
            │ PostgreSQL │  │   Redis    │
            │ Drizzle ORM│  │ Cache and  │
            │            │  │ Rate Limits│
            └────────────┘  └────────────┘
```

## 🗄️ Database Design

The application uses PostgreSQL to store library and user-related information.

The database includes the following main entities:

| Table            | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `users`          | Stores user account information.                |
| `books`          | Stores book details and associated information. |
| `categories`     | Organizes books into categories.                |
| `borrowed_books` | Tracks book borrowing records.                  |
| `reviews`        | Stores user reviews of books.                   |

The schema uses relational database concepts such as primary keys, foreign keys, and relationships between books, categories, users, and borrowing records.

Drizzle ORM is used to define schemas and interact with PostgreSQL.

## 🔐 Authentication & Security

* JWT-based authentication for protected API endpoints.
* Password hashing using bcrypt.
* Middleware-based authentication and authorization.
* Role-based access control for administrative operations.
* Zod validation for incoming requests.
* Rate limiting to restrict excessive API requests.
* Environment variables for sensitive configuration.
* Redis-backed rate limiting with an in-memory fallback.

## ⚡ Redis Caching & Rate Limiting

Redis is integrated into the backend to support caching and request rate limiting.

### Caching

Redis can be used to cache frequently requested data and reduce repeated database queries.

### Rate Limiting

The application uses `express-rate-limit` with Redis support to manage API request limits.

When Redis is unavailable, the rate limiter can fall back to in-memory storage, allowing the application to continue enforcing limits within the running server instance.

> Note: In-memory rate limiting is local to a server instance and does not provide shared limits across multiple instances.

## 📁 Project Structure

The project is organized into separate frontend and backend components.

```text
fullStack-library-project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── schemas/
│   ├── uploads/
│   ├── db/
│   ├── drizzle/
│   ├── index.js
│   └── package.json
│
└── README.md
```

*Adjust the folder names above if your current repository uses a different structure.*

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm
* [PostgreSQL](https://www.postgresql.org/)
* [Redis](https://redis.io/) (optional, depending on your configuration)
* Git

### 1. Clone the repository

```bash
git clone https://github.com/sumukhmd7/fullStack-library-project.git

cd fullStack-library-project
```

### 2. Set up the backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

```env
PORT=8000

DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/library_db

JWT_SECRET=your_jwt_secret

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Use the actual environment variable names expected by your backend code. Keep your `.env` file private and never commit credentials or secrets to GitHub.

### 3. Configure the database

Create a PostgreSQL database for the application.

For example:

```sql
CREATE DATABASE library_db;
```

Run the database migrations using the scripts and configuration available in your backend.

If your project uses Drizzle Kit migrations:

```bash
npx drizzle-kit migrate
```

If your setup uses schema push instead, use the appropriate Drizzle command configured for your project.

### 4. Start the backend server

```bash
npm start
```

If your project uses a different development script, run:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:8000
```

### 5. Set up the frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Configure the frontend API base URL according to your backend setup.

For example, if your Axios configuration supports environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## 🔌 API Overview

The backend exposes REST API endpoints for user authentication, book management, categories, reviews, and borrowing-related functionality.

The following is a conceptual overview; replace the example routes with the exact routes defined in your application.

| Module         | Operations                              |
| -------------- | --------------------------------------- |
| Authentication | Signup, login, password recovery        |
| Books          | Create, read, update, delete            |
| Categories     | Create, retrieve, update, delete        |       |
| Borrowing      | Manage borrowing records                |
| User Profile   | Retrieve and update user information    |
| Administration | Protected library management operations |

## 🧪 Testing

API endpoints can be tested using tools such as:

* Postman
* Browser developer tools
* Frontend application workflows

Recommended scenarios include:

* User registration and login.
* Accessing protected routes with and without a valid JWT.
* Admin authorization.
* CRUD operations for books and categories.
* Validation of invalid request payloads.
* Redis availability and rate-limiter fallback behavior.
* Database connectivity and error handling.

## 🔮 Future Enhancements

Potential improvements include:

* Automated backend and frontend testing.
* Docker-based deployment.
* CI/CD pipeline integration.
* Improved database query optimization and indexing.
* Cursor-based pagination for large book collections.
* More comprehensive API documentation.
* Cloud deployment and production monitoring.
* Enhanced borrowing and book availability workflows.

## 👨‍💻 Author

**Sumukh M D**

Full Stack Developer | Node.js | React.js | PostgreSQL

* GitHub: [@sumukhmd7](https://github.com/sumukhmd7)
* Project Repository: [Full Stack Library Management System](https://github.com/sumukhmd7/fullStack-library-project)

---

⭐ If you find this project interesting, feel free to explore the repository and share your feedback.
