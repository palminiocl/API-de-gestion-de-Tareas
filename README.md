# 📝 Task Management API

A RESTful API for task management, built with Node.js, Express, and Sequelize, using SQLite as the database. This API allows creating, listing, updating, and deleting tasks, with optional WebSocket support.

## 🚀 Features

- Full CRUD for tasks (`/tasks`)
- Persistent storage using SQLite
- Middleware for automatic timestamp updates
- Optional WebSocket support (`tasksUpdated` emitted on changes)

---

## ⚙️ Requirements

- Node.js (version 18 or higher recommended)
- npm (v7+)

---

## 🛠 Installation

1. Clone this repository:
```bash
    git clone https://github.com/your-username/Task-Management-API.git
    cd Task-Management-API
```

2. Install dependencies:

```bash
    npm install
```

---

## 🧪 Run Tests

```bash
npm test
```

This runs tests using Jest and Supertest. The database is automatically reset before each test suite.

---

## ▶️ Run the Application

You can run the API in development mode with:

```bash
npm run dev
```

---

## 📂 Project Structure

```
.
├── models/
│   └── Task.js            # Sequelize model
├── public/                # Static files (if used)
├── tests/
│   └── *.test.js          # Jest test cases
├── app.js                 # Main API
├── sequelize.js           # Database connection
└── README.md
```

---

## 💡 Design Decisions

* **Sequelize + SQLite**: Provides a lightweight database, ideal for local development or quick deployment without additional servers.
* **Minimal validations**: The model requires only a `title` and sets a default `status` as `'pending'`.
* **Decoupled WebSocket**: The `broadcastTasks()` function does not fail if `Socket.IO` has not been initialized (useful in test environments).
* **No automatic timestamps**: `timestamps: false` was disabled to have explicit control over `createdAt` and `updatedAt`.

