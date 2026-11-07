DBMS Level 3 Project - Smart Canteen Management System
# 🍽️ Smart Canteen Management System

A database-driven web application designed to simplify and automate canteen operations, including food menu management, customer ordering, inventory tracking, and feedback management.

The system integrates **PostgreSQL (Relational Database)** and **MongoDB (NoSQL Database)** to demonstrate the use of multiple database paradigms in a real-world application.

---

## 👥 Team Members

| Name | SRN |
|---|---|
| Gowtham B | PES1UG24CS172 |
| C Nitish | PES1UG25CS809 |

---

## 1. Problem Statement

Traditional canteen management involves manual food ordering, inventory tracking, menu updates, and order record maintenance. These processes can lead to delays, inaccurate stock information, and difficulty managing customer feedback.

The Smart Canteen Management System provides a centralized digital platform to manage these operations efficiently using a modern web application and integrated databases.

## 2. Project Objectives

- Develop a centralized canteen management application.
- Simplify food menu and category management.
- Manage customer orders and order details.
- Track inventory and stock availability.
- Store and analyze customer feedback.
- Maintain database consistency and integrity.
- Integrate relational and NoSQL databases.
- Demonstrate advanced database concepts.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Relational Database | PostgreSQL |
| NoSQL Database | MongoDB |
| Database Libraries | pg, mongodb |
| Runtime | Node.js |
| IDE | Visual Studio Code |
| Version Control | Git and GitHub |

## 4. System Features

### 4.1 Authentication and Role Management
- User login and logout.
- Role-based access control.
- Admin, Staff, and Customer roles.
- Protected API endpoints.

### 4.2 Food Menu Management
- Add new food items.
- Update food details and prices.
- Delete food items.
- Manage food categories.
- Update food availability.
- Upload individual food images.

### 4.3 Order Management
- Manage customer orders.
- Maintain order details.
- Calculate order totals.
- Store order-related information.

### 4.4 Inventory Management
- Maintain ingredient information.
- Track available stock.
- Record inventory transactions.
- Identify low-stock ingredients.
- Automatically update stock through database triggers.

### 4.5 Reports
- Display canteen-related reports.
- Analyze order information.
- Monitor inventory information.

### 4.6 Customer Feedback
- Store customer feedback in MongoDB.
- Retrieve feedback records.
- Analyze feedback using aggregation operations.

## 5. Database Architecture

The system uses two different database paradigms.

### 5.1 PostgreSQL: Relational Database

PostgreSQL is used to store structured and transactional information.

**Main tables:**

| Table | Purpose |
|---|---|
| users | Stores user information |
| categories | Stores food categories |
| menu_items | Stores food menu details |
| orders | Stores customer orders |
| order_items | Stores individual order items |
| payments | Stores payment information |
| suppliers | Stores supplier information |
| inventory | Maintains ingredient stock |
| inventory_transactions | Records stock movements |

**Database concepts implemented:**
- Primary keys and foreign keys.
- Data integrity constraints.
- INSERT, UPDATE, DELETE and SELECT.
- JOIN operations.
- Aggregate functions.
- GROUP BY and HAVING.
- Subqueries.
- Indexing.
- Views.
- Stored functions.
- Stored procedures.
- Triggers.
- Transactions.

### 5.2 MongoDB: NoSQL Database

MongoDB is used for flexible, document-oriented data.

**Main collections:**

| Collection | Purpose |
|---|---|
| customer_feedback | Stores customer feedback |
| order_activity_logs | Stores order activity information |

**MongoDB concepts:**
- Database and collection creation.
- Document insertion.
- Document retrieval.
- Document-based storage.
- Indexing.
- Aggregation pipeline.

## 6. Advanced Database Concepts

The following advanced database concepts are demonstrated in the project.

| Concept | Implementation |
|---|---|
| Transactions | Transaction-based database operations |
| Triggers | Automatic inventory stock updates |
| Stored Function | `calculate_order_total()` |
| Stored Procedure | `update_order_total()` |
| View | `low_stock_items` |
| Indexing | Indexes on frequently queried columns |
| MongoDB Aggregation | Customer feedback rating analysis |

## 7. Project Architecture

The application follows a frontend, backend API, and database architecture.

```text
              USER
                |
                v
       NEXT.JS WEB APPLICATION
                |
                v
          NEXT.JS API ROUTES
                |
         +------+------+
         |             |
         v             v
     POSTGRESQL      MONGODB
     DATABASE        DATABASE
         |             |
         v             v
   Structured      Flexible
   Information     Documents
```

## 8. Project Folder Structure

```text
smart_canteen_management_system/
│
├── public/
│   └── uploads/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   └── me/
│   │   │   ├── db-test/
│   │   │   ├── feedback/
│   │   │   ├── inventory/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   ├── reports/
│   │   │   └── upload/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       ├── db.ts
│       ├── mongodb.ts
│       ├── auth.ts
│       └── authorization.ts
│
├── .env.local
├── package.json
└── README.md
```

## 9. Installation and Execution

### Prerequisites

Install the following software:

- Node.js
- PostgreSQL
- MongoDB Community Server
- MongoDB Shell (mongosh)
- Visual Studio Code
- Git

### Step 1: Clone the repository

```bash
git clone https://github.com/Gowthamm08/smart_canteen_management_system.git
```

```bash
cd smart_canteen_management_system
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env.local` file in the project root directory.

Configure your own local database credentials:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/smart_canteen_db

MONGODB_URI=mongodb://localhost:27017

MONGODB_DATABASE=smart_canteen_nosqldb

SESSION_SECRET=YOUR_SECRET_VALUE
```

**Important:** Replace the placeholder values with your actual local configuration. Never upload `.env.local` or database passwords to GitHub.

### Step 4: Create the PostgreSQL database

Open PostgreSQL and execute:

```sql
CREATE DATABASE smart_canteen_db;
```

Connect to the database:

```sql
\c smart_canteen_db
```

Execute the project's SQL table creation scripts and database object definitions.

### Step 5: Configure MongoDB

Start MongoDB Community Server.

Open mongosh and execute:

```javascript
use smart_canteen_nosqldb
```

Create the required collections:

```javascript
db.createCollection("customer_feedback")
db.createCollection("order_activity_logs")
```

Insert the required sample documents and create the indexes used by the application.

### Step 6: Start the application

```bash
npm run dev
```

Open your browser:

http://localhost:3000

## 10. Security and Data Integrity

The application incorporates the following security and integrity measures:

- Role-based authorization.
- Protected API endpoints.
- Parameterized SQL queries.
- Environment-based configuration.
- Input validation.
- Database constraints.
- Password hashing.

## 11. Testing

The following areas should be tested before submission:

| Test Case | Expected Result |
|---|---|
| Database connection | Successful connection |
| User login | Valid users can log in |
| Invalid login | Access is rejected |
| Menu retrieval | Food items are displayed |
| Add food item | New item is stored |
| Update food item | Existing item is updated |
| Delete food item | Item is deleted when permitted |
| Image upload | Valid image is uploaded |
| Inventory update | Stock is updated correctly |
| Low-stock detection | Low-stock ingredients are identified |
| MongoDB feedback | Feedback documents are retrieved |
| MongoDB aggregation | Feedback statistics are calculated |

Record the actual result of each test during project validation.

## 12. Screenshots

Add screenshots of the following application and database operations:

1. Login page.
2. Admin dashboard.
3. Food menu.
4. Add and update food item.
5. Food image upload.
6. Order management.
7. Inventory management.
8. Reports dashboard.
9. Customer feedback.
10. PostgreSQL query execution.
11. MongoDB collection and aggregation output.

Suggested folder:

```text
screenshots/
```

## 13. Individual Contributions

| Team Member | Contributions |
|---|---|
| Gowtham B | Project development, Next.js integration, API implementation, database integration and testing |
| C Nitish | Database design, SQL and MongoDB implementation, testing and documentation |

*Update this table to reflect the actual work completed by each team member.*

## 14. Future Enhancements

- Online payment gateway integration.
- QR-code-based food ordering.
- Real-time order status tracking.
- Advanced sales analytics.
- Demand forecasting.
- Mobile application integration.

## 15. Conclusion

The Smart Canteen Management System demonstrates the integration of modern web application development with relational and NoSQL databases.

By combining Next.js, PostgreSQL, and MongoDB, the application provides a platform for managing food menus, orders, inventory, and customer feedback while demonstrating important database concepts such as transactions, triggers, stored procedures, views, indexing, and aggregation.

## 16. GitHub Repository

**Repository:** https://github.com/Gowthamm08/smart_canteen_management_system

**Project:** Smart Canteen Management System

**Course:** Database Management Systems

---

**Developed by**

Gowtham B | PES1UG24CS172  
C Nitish | PES1UG25CS809
