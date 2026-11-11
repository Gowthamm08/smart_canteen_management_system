# SMART CANTEEN MANAGEMENT SYSTEM
### DBMS Experiential Learning – Level 3 Project Report

**Project Title:** Smart Canteen Management System

**Team Members:**

| Name | SRN |
|---|---|
| Gowtham B | PES1UG24CS172 |
| C Nitish | PES1UG25CS809 |

**GitHub Repository:**  
https://github.com/Gowthamm08/smart_canteen_management_system

---

# 1. Abstract

The Smart Canteen Management System is a web-based application designed to simplify and automate daily canteen operations, including food menu management, customer ordering, inventory tracking, and customer feedback management.

The system integrates Next.js for web application development, PostgreSQL as a relational database, and MongoDB as a NoSQL database.

PostgreSQL manages structured and transactional information such as users, food categories, menu items, orders, payments, suppliers, and inventory. MongoDB stores flexible document-oriented information such as customer feedback and order activity logs.

The project demonstrates database design, relational schema implementation, SQL queries, database constraints, indexing, triggers, stored functions, stored procedures, and MongoDB aggregation.

# 2. Problem Statement

Traditional canteen management often involves manual food ordering, inventory tracking, menu updates, and customer feedback management.

These processes can result in:
- Inefficient order management.
- Difficulty tracking ingredient availability.
- Manual errors in inventory records.
- Difficulty maintaining customer feedback.
- Limited access to organized reports.

The Smart Canteen Management System addresses these problems through a centralized web-based application integrated with relational and NoSQL databases.

# 3. Objectives

- Develop a centralized canteen management application.
- Simplify food menu and category management.
- Manage customer orders and payments.
- Maintain ingredient stock information.
- Record inventory transactions.
- Store and analyze customer feedback.
- Maintain database consistency and integrity.
- Demonstrate SQL and NoSQL database integration.
- Implement advanced database concepts.

# 4. Scope

The project covers:
- User authentication and role management.
- Food menu management.
- Food image uploading.
- Order management.
- Inventory management.
- Supplier information.
- Customer feedback.
- Order activity tracking.
- Database operations and reporting.

# 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React |
| Programming Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| SQL Database | PostgreSQL 18.6 |
| NoSQL Database | MongoDB |
| MongoDB Shell | mongosh |
| Database Libraries | pg, mongodb |
| Runtime | Node.js |
| IDE | Visual Studio Code |
| Version Control | Git and GitHub |

# 6. Database Selection and Justification

The project uses Option 1: SQL + NoSQL.

## 6.1 PostgreSQL

PostgreSQL is used to manage structured and relational data.

It stores:
- User information.
- Food categories.
- Menu items.
- Customer orders.
- Order items.
- Payment information.
- Supplier information.
- Inventory records.
- Inventory transactions.

PostgreSQL was selected because it supports relational data modelling, primary keys, foreign keys, constraints, transactions, indexing, stored procedures, functions, and complex SQL queries.

## 6.2 MongoDB

MongoDB is used to store flexible document-oriented information.

It stores:
- Customer feedback.
- Order activity logs.

MongoDB was selected because its document-oriented model supports flexible data structures and provides aggregation operations for analysing customer feedback.

# 7. Database Design

## 7.1 PostgreSQL Database

**Database name:** `smart_canteen_db`

Verified database structure:

- 9 relational tables.
- 1 view.
- 9 primary keys.
- 7 foreign keys.
- UNIQUE and CHECK constraints.
- 19 indexes.

### 7.2 Relational Schema

**USERS**

`USERS(user_id PK, full_name, email UNIQUE, password_hash, phone UNIQUE, role, created_at)`

**CATEGORIES**

`CATEGORIES(category_id PK, category_name UNIQUE, description, created_at)`

**MENU_ITEMS**

`MENU_ITEMS(item_id PK, item_name, description, price, category_id FK, is_available, created_at, image_url)`

**ORDERS**

`ORDERS(order_id PK, user_id FK, order_date, total_amount, order_status)`

**ORDER_ITEMS**

`ORDER_ITEMS(order_item_id PK, order_id FK, item_id FK, quantity, unit_price)`

**PAYMENTS**

`PAYMENTS(payment_id PK, order_id FK UNIQUE, amount, payment_method, payment_status, payment_date)`

**SUPPLIERS**

`SUPPLIERS(supplier_id PK, supplier_name, contact_person, phone UNIQUE, email UNIQUE, address, created_at)`

**INVENTORY**

`INVENTORY(inventory_id PK, ingredient_name, quantity, unit, minimum_stock, supplier_id FK, last_updated)`

**INVENTORY_TRANSACTIONS**

`INVENTORY_TRANSACTIONS(transaction_id PK, inventory_id FK, transaction_type, quantity, transaction_date, notes)`

## 7.3 Entity Relationships

The following relationships were verified from PostgreSQL foreign-key constraints:

| Parent Entity | Child Entity | Relationship |
|---|---|---|
| Users | Orders | One-to-Many |
| Categories | Menu Items | One-to-Many |
| Orders | Order Items | One-to-Many |
| Menu Items | Order Items | One-to-Many |
| Orders | Payments | One-to-Zero-or-One |
| Suppliers | Inventory | One-to-Many |
| Inventory | Inventory Transactions | One-to-Many |

The Payments relationship is one-to-zero-or-one because `payments.order_id` has a UNIQUE constraint.

**ER Diagram:** Insert the generated ER diagram here.

## 7.4 Database Constraints

The database implements the following constraints:

**Primary Keys**
- All nine tables have primary keys.

**Foreign Keys**
- Orders reference users.
- Menu items reference categories.
- Order items reference orders and menu items.
- Payments reference orders.
- Inventory references suppliers.
- Inventory transactions reference inventory.

**UNIQUE Constraints**
- User email and phone.
- Category name.
- Supplier email and phone.
- Payment order ID.

**CHECK Constraints**
- Inventory quantity must be non-negative.
- Minimum stock must be non-negative.
- Menu item price must be positive.
- Order quantity must be positive.
- Order item unit price must be positive.
- Order total cannot be negative.
- Transaction quantity must be positive.
- Transaction type must be STOCK_IN or STOCK_OUT.
- User roles must be ADMIN, STAFF, or CUSTOMER.
- Order and payment statuses must use permitted values.

**NOT NULL Constraints**

Required attributes such as user email, password hash, menu item name, inventory quantity, order details, and payment information cannot be NULL.

# 8. MongoDB Database Design

**Database name:** `smart_canteen_nosqldb`

Two collections were verified.

## 8.1 Customer Feedback Collection

Collection: `customer_feedback`

Actual document structure includes:

| Attribute | Data Type | Description |
|---|---|---|
| _id | ObjectId | Unique document ID |
| customer_name | String | Customer name |
| customer_id | Number | Customer identifier, present in some documents |
| food_item | String | Reviewed food item |
| rating | Number | Customer rating |
| comment | String | Feedback comment |
| feedback_date | Date | Feedback timestamp in older documents |
| created_at | Date | Feedback timestamp in newer documents |

Verified document count: 7.

The collection demonstrates flexible document structures, with different timestamp fields across existing records.

## 8.2 Order Activity Logs Collection

Collection: `order_activity_logs`

| Attribute | Data Type | Description |
|---|---|---|
| _id | ObjectId | Unique document ID |
| order_id | Number | Associated order |
| customer_name | String | Customer name |
| status | String | Order status |
| description | String | Activity description |
| activity_date | Date | Activity timestamp |

Verified document count: 3.

The sample records demonstrate order lifecycle activities:
- PENDING
- CONFIRMED
- PREPARING

## 8.3 MongoDB Indexes

The following indexes were verified:

| Collection | Index | Field |
|---|---|---|
| customer_feedback | _id_ | _id |
| customer_feedback | customer_name_1 | customer_name |
| order_activity_logs | _id_ | _id |
| order_activity_logs | order_id_1 | order_id |

MongoDB automatically creates the `_id` index. Additional indexes support searches using customer names and order IDs.

## 8.4 MongoDB Retrieval Strategy

The collections can be queried using MongoDB find operations.

Examples:

```javascript
db.customer_feedback.find({
    customer_name: "Rahul"
})
```

```javascript
db.order_activity_logs.find({
    order_id: 1
})
```

The customer feedback collection is also analysed using an aggregation pipeline.

# 9. SQL Implementation

The PostgreSQL implementation includes:

**DDL Operations**
- CREATE TABLE.
- ALTER TABLE.
- Primary and foreign keys.
- UNIQUE constraints.
- CHECK constraints.
- NOT NULL constraints.
- CREATE INDEX.
- CREATE VIEW.
- CREATE FUNCTION.
- CREATE PROCEDURE.
- CREATE TRIGGER.

**DML Operations**
- INSERT.
- UPDATE.
- DELETE.
- SELECT.

**Query Operations to Demonstrate**
- JOIN.
- GROUP BY.
- HAVING.
- ORDER BY.
- Aggregate functions.
- Subqueries.

Actual SQL execution screenshots and query outputs will be included in the final evidence section.

# 10. Advanced Database Concepts

The following database objects and operations have been verified.

## 10.1 Trigger

Trigger name: `trg_update_inventory_stock`

Table: `inventory_transactions`

Event: AFTER INSERT

Function: `update_inventory_stock()`

The trigger automatically updates inventory quantities whenever a stock transaction is inserted.

- STOCK_IN increases the available quantity.
- STOCK_OUT decreases the available quantity.
- The last_updated field is updated.

The inventory quantity CHECK constraint prevents negative stock values.

## 10.2 Stored Function

Function: `calculate_order_total(p_order_id)`

Return type: NUMERIC.

Purpose: Calculates the total amount of an order.

## 10.3 Stored Procedure

Procedure: `update_order_total(p_order_id)`

Purpose: Calls `calculate_order_total()` and updates the corresponding order's total amount.

## 10.4 View

View: `low_stock_items`

Purpose: Identifies inventory ingredients whose available quantity is at or below the minimum stock level.

## 10.5 Indexing

PostgreSQL contains 19 verified indexes.

Important custom indexes:

- `idx_inventory_ingredient`
- `idx_menu_items_category`
- `idx_orders_date`
- `idx_orders_user`

These indexes improve retrieval performance for frequently searched and filtered columns.

## 10.6 MongoDB Aggregation

The customer feedback collection uses an aggregation pipeline with:

- `$group`
- `$avg`
- `$sum`
- `$max`
- `$min`

Actual execution result:

| Metric | Result |
|---|---:|
| Total Feedback | 7 |
| Average Rating | 4.57 |
| Highest Rating | 5 |
| Lowest Rating | 3 |

This demonstrates the use of NoSQL aggregation for customer satisfaction analysis.

# 11. System Architecture

The application follows a frontend, backend API, and database architecture.

```text
             USERS
                |
                v
       NEXT.JS WEB APPLICATION
                |
                v
          NEXT.JS API ROUTES
                |
          +-----+-----+
          |           |
          v           v
      POSTGRESQL    MONGODB
      DATABASE      DATABASE
          |           |
          v           v
      RELATIONAL   DOCUMENT
        DATA         DATA
```

The Next.js backend communicates with PostgreSQL and MongoDB through their respective database libraries.

# 12. Security and Data Integrity

The application includes authentication and role-based authorization.

Database-level integrity is supported by:
- Primary keys.
- Foreign keys.
- UNIQUE constraints.
- CHECK constraints.
- NOT NULL constraints.
- Parameterized SQL queries.

Environment variables are used for database configuration.

Further security verification, including password hashing and complete transaction handling, will be documented with implementation evidence.

# 13. Testing

The following test cases are planned for final validation.

| Test Case | Expected Result |
|---|---|
| PostgreSQL connection | Successful connection |
| MongoDB connection | Successful connection |
| User authentication | Valid users can log in |
| Invalid authentication | Access rejected |
| Menu retrieval | Food items displayed |
| Add menu item | Item stored |
| Update menu item | Item updated |
| Delete menu item | Item deleted when permitted |
| Food image upload | Valid image uploaded |
| Inventory STOCK_IN | Quantity increases |
| Inventory STOCK_OUT | Quantity decreases |
| Low-stock detection | Low-stock ingredients identified |
| Customer feedback | Feedback stored in MongoDB |
| Feedback aggregation | Statistics calculated |

Actual test results and screenshots will be added after completing application-level testing.

# 14. Application Screenshots

The final report will include:

1. Login page.
2. Admin dashboard.
3. Food menu.
4. Add and update food item.
5. Food image upload.
6. Order management.
7. Inventory management.
8. Reports dashboard.
9. Customer feedback.
10. PostgreSQL database tables.
11. PostgreSQL trigger and stored routine outputs.
12. MongoDB collections and documents.
13. MongoDB aggregation output.

# 15. Team Contributions

| Team Member | SRN | Contribution Areas |
|---|---|---|
| Gowtham B | PES1UG24CS172 | Project development, Next.js integration, API implementation, database integration and testing |
| C Nitish | PES1UG25CS809 | Database design, SQL and MongoDB implementation, testing and documentation |

The final contribution details should reflect each member's actual work and individual GitHub commits.

# 16. Future Enhancements

- Online payment gateway integration.
- QR-code-based food ordering.
- Real-time order status updates.
- Advanced sales analytics.
- Demand forecasting.
- Mobile application integration.

# 17. Conclusion

The Smart Canteen Management System demonstrates the integration of modern web application development with relational and NoSQL databases.

PostgreSQL manages structured transactional data, while MongoDB manages flexible document-oriented information.

The project demonstrates relational database design, data integrity, SQL operations, indexing, triggers, stored functions, stored procedures, views, and NoSQL aggregation.

The integration of Next.js, PostgreSQL, and MongoDB provides a practical example of applying database management concepts to a real-world canteen management problem.

# 18. GitHub Repository

**Project Repository:**

https://github.com/Gowthamm08/smart_canteen_management_system

**Project Title:** Smart Canteen Management System

**Course:** Database Management Systems – Level 3

**Team Members:**

Gowtham B | PES1UG24CS172  
C Nitish | PES1UG25CS809