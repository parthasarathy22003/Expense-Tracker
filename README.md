# 💰 Expense Management System

A full-stack **Expense Management System** built with **React, Vite, TailwindCSS, Node.js, Express, Sequelize, and MySQL**.

The application allows users to manage their **expenses and income**, filter and sort transactions, view financial summaries, and understand their spending through interactive reports and charts.

---

## 📌 Overview

The project is divided into two applications:

* **Frontend** — React + Vite + TailwindCSS
* **Backend** — Node.js + Express + Sequelize + MySQL

The frontend communicates with the backend through REST APIs using Axios. Vite is configured to proxy `/api` requests to the Express backend during development.

### Main Modules

* 📊 Dashboard
* 💸 Expense Management
* 💰 Income Management
* 📈 Financial Reports
* 🔎 Search and Filters
* ↕️ Sorting
* 📄 Pagination
* 👤 User ID switching
* 🔔 Success and error notifications
* 📱 Responsive UI

---

# ✨ Features

## 📊 Dashboard

The dashboard provides a quick view of the user's financial situation.

It displays:

* Total Income
* Total Expense
* Net Savings
* Savings Rate
* Monthly spending trend
* Cumulative spending
* Top spending categories

The dashboard loads income-vs-expense data, monthly trends, and top categories from the report APIs.

---

## 💸 Expense Management

Users can:

* Add expenses
* View expenses
* Edit expenses
* Delete expenses
* Search expenses
* Filter by category
* Filter by payment mode
* Filter by date range
* Sort by date
* Sort by category
* Sort by amount
* Navigate through paginated results

The expense page also provides modal-based forms and confirmation before deletion.

### Expense Categories

The application supports categories such as:

* Food
* Travel
* Rent
* Shopping
* Bills
* Entertainment
* Health
* Education
* Other

### Payment Modes

* CASH
* CARD
* UPI
* NET_BANKING
* WALLET
* OTHER

---

## 💰 Income Management

Users can:

* Add income
* View income
* Edit income
* Delete income
* Search income descriptions
* Filter by source
* Filter by date range
* Sort income
* Paginate income records

Supported income sources include:

* Salary
* Freelance
* Investment
* Rental
* Bonus
* Other

---

# 📈 Reports

The application provides several financial reports.

### Available Reports

| Report               | Description                                        |
| -------------------- | -------------------------------------------------- |
| Monthly Summary      | Monthly spending totals and transaction statistics |
| Category Summary     | Spending grouped by category                       |
| Payment Mode Summary | Spending grouped by payment method                 |
| Top Categories       | Highest spending categories                        |
| Daily Trend          | Daily spending trend                               |
| Monthly Trend        | Monthly spending with cumulative total             |
| Income vs Expense    | Compare income and expenses                        |

The frontend is connected to these report endpoints through a dedicated `reportService`.

---

## 📊 Report Visualizations

The Reports page provides charts for:

* Income vs Expense
* Net savings
* Spending by category
* Spending by payment mode
* Spending trends

The income-vs-expense report can be grouped by:

* Day
* Month
* Year

The report UI uses Recharts for data visualization.

---

# 🔎 Filtering

Expenses support server-side filtering using:

```text
userId
category
paymentMode
startDate
endDate
minAmount
maxAmount
search
```

Example:

```http
GET /api/expenses?userId=user-001&category=Food&paymentMode=UPI
```

Multiple categories/payment modes can also be supplied as comma-separated values.

Example:

```http
GET /api/expenses?category=Food,Travel
```

---

# ↕️ Sorting

Transaction lists support sorting.

Example:

```http
GET /api/expenses?sortBy=amount&order=DESC
```

Supported expense sorting fields include:

```text
id
date
amount
category
paymentMode
createdAt
updatedAt
```

Income sorting supports:

```text
id
date
amount
source
createdAt
updatedAt
```

---

# 📄 Pagination

The API supports page-based pagination.

Example:

```http
GET /api/expenses?page=1&limit=10
```

The API returns metadata such as:

```json
{
  "totalItems": 100,
  "totalPages": 10,
  "currentPage": 1,
  "pageSize": 10,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

The frontend uses this metadata to display pagination controls.

---

# 🏗️ Project Architecture

```text
expense-management-system/
│
├── expense-frontend/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── api/
│       │   └── axios.js
│       │
│       ├── services/
│       │   ├── expenseService.js
│       │   ├── incomeService.js
│       │   └── reportService.js
│       │
│       ├── context/
│       │   └── UserContext.jsx
│       │
│       ├── hooks/
│       │   └── useDebounce.js
│       │
│       ├── utils/
│       │   └── format.js
│       │
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Header.jsx
│       │   ├── Modal.jsx
│       │   ├── Loader.jsx
│       │   ├── EmptyState.jsx
│       │   ├── Pagination.jsx
│       │   ├── StatCard.jsx
│       │   ├── FilterBar.jsx
│       │   └── Toast.jsx
│       │
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Expenses.jsx
│           ├── Incomes.jsx
│           └── Reports.jsx
│
└── expense-management-api/
    ├── .env.example
    ├── package.json
    ├── README.md
    │
    └── src/
        ├── app.js
        ├── server.js
        │
        ├── config/
        │   └── database.js
        │
        ├── models/
        │   ├── index.js
        │   ├── Expense.js
        │   └── Income.js
        │
        ├── controllers/
        │   ├── expenseController.js
        │   ├── incomeController.js
        │   └── reportController.js
        │
        ├── routes/
        │   ├── index.js
        │   ├── expenseRoutes.js
        │   ├── incomeRoutes.js
        │   └── reportRoutes.js
        │
        ├── middleware/
        │   └── errorHandler.js
        │
        ├── utils/
        │   ├── asyncHandler.js
        │   ├── query.js
        │   └── filters.js
        │
        ├── validators/
        │   ├── expenseValidator.js
        │   └── incomeValidator.js
        │
        └── seeders/
            └── seed.js
```

The frontend follows a modular structure with separate API, service, context, component, hook, utility, and page layers.

---

# 🛠️ Technology Stack

## Frontend

| Technology      | Purpose                           |
| --------------- | --------------------------------- |
| React 18        | UI development                    |
| Vite            | Development server and build tool |
| TailwindCSS     | Styling                           |
| Axios           | REST API communication            |
| React Router    | Application routing               |
| Recharts        | Charts and reports                |
| React Hot Toast | Notifications                     |
| Lucide React    | Icons                             |

The frontend package uses React, Axios, React Router, Recharts, TailwindCSS and related Vite tooling.

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express    | REST API                  |
| Sequelize  | ORM                       |
| MySQL      | Database                  |
| MySQL2     | MySQL driver              |
| Helmet     | HTTP security headers     |
| CORS       | Cross-origin support      |
| Morgan     | HTTP request logging      |
| dotenv     | Environment configuration |

---

# 🗄️ Database

The application uses MySQL with Sequelize.

Two main tables are used:

## `expenses`

Important fields:

```text
id
user_id
category
amount
date
payment_mode
description
created_at
updated_at
```

## `incomes`

Important fields:

```text
id
user_id
source
amount
date
description
created_at
updated_at
```

Indexes are provided for commonly filtered fields such as user, category/source, date, and payment mode.

---

# 🔌 API Endpoints

Base URL:

```text
http://localhost:3000/api
```

---

## Expense APIs

### Create Expense

```http
POST /api/expenses
```

Example request:

```json
{
  "userId": "user-001",
  "category": "Food",
  "amount": 450,
  "date": "2026-09-15",
  "paymentMode": "UPI",
  "description": "Lunch"
}
```

---

### Get Expenses

```http
GET /api/expenses
```

Example:

```http
GET /api/expenses?userId=user-001&page=1&limit=10
```

---

### Get Single Expense

```http
GET /api/expenses/:id
```

Example:

```http
GET /api/expenses/1
```

---

### Update Expense

```http
PUT /api/expenses/:id
```

---

### Partial Update Expense

```http
PATCH /api/expenses/:id
```

---

### Delete Expense

```http
DELETE /api/expenses/:id
```

The frontend expense service maps directly to these CRUD endpoints.

---

# 💵 Income APIs

### Create Income

```http
POST /api/incomes
```

Example:

```json
{
  "userId": "user-001",
  "source": "Salary",
  "amount": 65000,
  "date": "2026-09-01",
  "description": "Monthly salary"
}
```

---

### Get Incomes

```http
GET /api/incomes
```

Example:

```http
GET /api/incomes?userId=user-001&page=1&limit=10
```

---

### Get Single Income

```http
GET /api/incomes/:id
```

---

### Update Income

```http
PUT /api/incomes/:id
```

---

### Partial Update Income

```http
PATCH /api/incomes/:id
```

---

### Delete Income

```http
DELETE /api/incomes/:id
```

---

# 📊 Report APIs

## Monthly Summary

```http
GET /api/reports/summary/monthly
```

---

## Category Summary

```http
GET /api/reports/summary/category
```

---

## Payment Mode Summary

```http
GET /api/reports/summary/payment-mode
```

---

## Top Categories

```http
GET /api/reports/top-categories?limit=5
```

---

## Daily Spending Trend

```http
GET /api/reports/trends/daily?days=30
```

---

## Monthly Spending Trend

```http
GET /api/reports/trends/monthly
```

---

## Income vs Expense

```http
GET /api/reports/income-vs-expense
```

### Group by Month

```http
GET /api/reports/income-vs-expense?groupBy=month
```

### Group by Day

```http
GET /api/reports/income-vs-expense?groupBy=day
```

### Group by Year

```http
GET /api/reports/income-vs-expense?groupBy=year
```

The frontend's service layer exposes all of these report operations.

---

# ❤️ Health Check

The backend provides a health-check endpoint:

```http
GET /health
```

Example response:

```json
{
  "success": true,
  "service": "expense-management-api",
  "uptime": 123.45,
  "timestamp": "2026-09-15T09:30:00.000Z"
}
```

---

# ⚙️ Environment Configuration

## Backend

Create a `.env` file inside:

```text
expense-management-api/
```

Example:

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=expense_db
DB_USER=root
DB_PASSWORD=root
DB_LOGGING=false
```

Make sure MySQL is running before starting the backend.

---

## Frontend

Create a `.env` file inside:

```text
expense-frontend/
```

Example:

```env
VITE_API_BASE_URL=/api
VITE_DEFAULT_USER_ID=user-001
```

The current frontend configuration uses `/api` as the API base URL and `user-001` as the default user ID.

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd expense-management-system
```

---

# 🖥️ Backend Setup

Go to the backend directory:

```bash
cd expense-management-api
```

Install dependencies:

```bash
npm install
```

Configure the database in `.env`.

Then start the development server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

The backend startup authenticates the MySQL connection and synchronizes the Sequelize models before starting the Express server.

---

# 🌐 Frontend Setup

Open another terminal:

```bash
cd expense-frontend
```

Install dependencies:

```bash
npm install
```

Install the icon library used by the UI:

```bash
npm install lucide-react
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

The Vite development server proxies API requests:

```text
Frontend
   │
   │ /api/*
   ▼
Vite Proxy
   │
   ▼
Express Backend
   │
   ▼
MySQL
```

The Vite configuration maps `/api` to `http://localhost:3000`.

---

# 🌱 Seed Sample Data

The backend includes a seed script for generating sample expenses and income.

From the backend directory:

```bash
npm run seed
```

You can also provide a custom user ID:

```bash
npm run seed -- user-002
```

The seed script generates sample expense records across different categories and payment modes and creates income records for several months.

After seeding, use:

```text
user-001
```

or your custom user ID in the frontend.

---

# 🧪 Example API Flow

### 1. Create an expense

```http
POST http://localhost:3000/api/expenses
```

```json
{
  "userId": "user-001",
  "category": "Food",
  "amount": 300,
  "date": "2026-09-15",
  "paymentMode": "UPI",
  "description": "Dinner"
}
```

### 2. Get expenses

```http
GET http://localhost:3000/api/expenses?userId=user-001
```

### 3. Add income

```http
POST http://localhost:3000/api/incomes
```

```json
{
  "userId": "user-001",
  "source": "Salary",
  "amount": 60000,
  "date": "2026-09-01",
  "description": "September salary"
}
```

### 4. View financial summary

```http
GET http://localhost:3000/api/reports/income-vs-expense?userId=user-001&groupBy=month
```

---

# 🔄 Frontend ↔ Backend Flow

The application follows this flow:

```text
                React Frontend
                      │
                      ▼
                Axios Service
                      │
                      ▼
                REST API
                      │
                      ▼
              Express Routes
                      │
                      ▼
               Controllers
                      │
                      ▼
                 Sequelize
                      │
                      ▼
                  MySQL
```

For example:

```text
Expenses.jsx
     │
     ▼
expenseService.js
     │
     ▼
Axios
     │
     ▼
GET /api/expenses
     │
     ▼
expenseController.js
     │
     ▼
Expense Sequelize Model
     │
     ▼
MySQL
```

The Axios layer also unwraps successful responses and normalizes backend errors into a common structure for the frontend.

---

# 👤 User Management

This project currently uses a simple **User ID based system** rather than a full authentication system.

The user ID can be changed from the application header.

The selected user ID is stored in browser `localStorage`, so it remains available after refreshing the page.

Example:

```text
user-001
user-002
user-003
```

> **Note:** This is not authentication. It is a simple user-data separation mechanism for the current project.

---

# 🎨 UI Features

The frontend includes:

* Responsive sidebar
* Mobile navigation
* Header with user switcher
* Dashboard cards
* Modal forms
* Responsive tables
* Loading states
* Empty states
* Toast notifications
* Search
* Filters
* Pagination
* Sortable table columns
* Responsive charts

The application uses TailwindCSS utility classes for the UI and has responsive layouts for smaller screens.

---

# 📱 Responsive Design

The application is designed for:

* 💻 Desktop
* 🖥️ Large screens
* 📱 Mobile devices
* 📟 Tablet-sized screens

On smaller screens:

* Sidebar becomes a mobile menu
* Tables can scroll horizontally
* Grid layouts adapt to screen size
* Forms adjust to available width

---

# 🧩 Important Frontend Components

| Component    | Purpose                        |
| ------------ | ------------------------------ |
| `Layout`     | Main application layout        |
| `Sidebar`    | Navigation                     |
| `Header`     | User ID and application header |
| `Modal`      | Add/Edit forms                 |
| `Loader`     | Loading state                  |
| `EmptyState` | Empty data state               |
| `Pagination` | Page navigation                |
| `StatCard`   | Dashboard KPI cards            |
| `FilterBar`  | Search and filtering           |
| `Toast`      | Success/error notifications    |

---

# 📂 Main Pages

## Dashboard

```text
/dashboard
```

Shows:

* Income
* Expenses
* Savings
* Savings rate
* Monthly spending
* Top categories

---

## Expenses

```text
/expenses
```

Used to manage expense records.

---

## Incomes

```text
/incomes
```

Used to manage income records.

---

## Reports

```text
/reports
```

Used to analyze income, expenses, categories, payment modes, and trends.

---

# 🛡️ Error Handling

The backend includes centralized error handling.

Common responses include:

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

### Not Found

```json
{
  "success": false,
  "message": "Expense not found"
}
```

### Database Error

```json
{
  "success": false,
  "message": "Database error"
}
```

The frontend Axios interceptor converts these backend errors into a consistent format for toast notifications.

---

# 🔐 Current Security Notes

The backend includes:

* Helmet
* CORS
* JSON request limits
* Input validation
* Whitelisted sorting fields
* Sequelize ORM
* Centralized error handling

### Important

This project does **not currently implement**:

* User registration
* Login
* Password authentication
* JWT authentication
* Role-based access control
* Refresh tokens

For a production application, authentication and authorization should be added.

---

# 🏭 Production Considerations

Before deploying this project to production, consider adding:

* JWT or session authentication
* Password hashing
* User database table
* Authorization middleware
* Rate limiting
* Request validation library
* Database migrations
* Automated tests
* API documentation
* Production logging
* HTTPS
* Secure CORS configuration
* Production environment variables
* Docker configuration
* CI/CD pipeline

---

# 🧪 Suggested Testing

The API can be tested using tools such as:

* Postman
* Insomnia
* Thunder Client
* cURL

Example:

```bash
curl http://localhost:3000/health
```

Example expense request:

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "category": "Food",
    "amount": 250,
    "date": "2026-09-15",
    "paymentMode": "UPI",
    "description": "Lunch"
  }'
```

---

# 📜 Available Scripts

## Backend

```bash
npm start
```

Starts the production Node.js server.

```bash
npm run dev
```

Starts the server using Nodemon.

```bash
npm run seed
```

Creates sample database records.

---

## Frontend

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

---

# 🗺️ API Route Summary

```text
/api
│
├── /expenses
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
├── /incomes
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── PATCH /:id
│   └── DELETE /:id
│
└── /reports
    ├── GET /summary/monthly
    ├── GET /summary/category
    ├── GET /summary/payment-mode
    ├── GET /top-categories
    ├── GET /trends/daily
    ├── GET /trends/monthly
    └── GET /income-vs-expense
```

---

# 🧠 Example Report Response

The income-vs-expense API provides a summary similar to:

```json
{
  "success": true,
  "report": "income-vs-expense",
  "groupBy": "month",
  "summary": {
    "totalIncome": 65000,
    "totalExpense": 32000,
    "netSavings": 33000,
    "savingsRate": 50.77,
    "status": "SURPLUS"
  },
  "data": []
}
```

Possible status values:

```text
SURPLUS
DEFICIT
```

---

# 🚧 Known Project Notes

During the code review, one frontend dependency needs attention.

The frontend components import:

```js
import { Menu, User2 } from 'lucide-react';
```

and other Lucide icons, but `lucide-react` is not listed in the provided `package.json`.

Install it with:

```bash
npm install lucide-react
```

Alternatively, add it to the frontend `package.json` dependencies and run:

```bash
npm install
```

This is important before running a production build.

---

# 🚀 Future Improvements

Possible future features:

* 🔐 Authentication and authorization
* 👥 Multiple user accounts
* 💳 Budget management
* 🎯 Monthly spending limits
* 🔔 Budget alerts
* 📤 Export reports to CSV/PDF
* 📅 Calendar-based expense view
* 🔁 Recurring expenses
* 💰 Recurring income
* 🏦 Bank account integration
* 🌙 Dark mode
* 📊 More advanced analytics
* 🧪 Unit and integration tests
* 🐳 Docker support
* ☁️ Cloud deployment

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone <your-fork-url>
```

### 2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

### 4. Commit your changes

```bash
git add .
git commit -m "Add new feature"
```

### 5. Push the branch

```bash
git push origin feature/new-feature
```

### 6. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Parthasarathy**

Built with:

```text
React + Vite + TailwindCSS
        +
Node.js + Express
        +
Sequelize + MySQL
```

---

## ⭐ If you like this project

Give the repository a ⭐ on GitHub and feel free to contribute!
