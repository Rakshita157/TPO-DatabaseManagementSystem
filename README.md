## Overview

TPO Portal is a web-based Training & Placement Management System developed for Government Women’s Engineering College, Ajmer (GWEC) to digitize and streamline the campus placement process.

The platform brings student profiles, academic records, placement tracking, coordinator management, and administrative operations together in one centralized system.

It provides students with a dedicated portal to maintain their placement profiles while enabling the Training & Placement Office to manage student information, verify profiles, update placement statuses, assign coordinators, and export structured reports.

## Project Objectives

Centralize student and placement-related information.

Reduce manual work in placement administration.

Provide secure, role-based access to portal features.

Simplify student profile verification and placement tracking.

Enable flexible data export for reporting and record management.

Improve access to college and coordinator information.

🧭 Table of Contents

✨ Features

🛠️ Technology Stack

🏗️ Architecture

📂 Project Structure

🔐 Security

🚀 Getting Started

⚙️ Environment Configuration

💡 Technical Highlights

🗺️ Future Enhancements

👥 Contributors

✨ Features

👨‍🎓 Student Portal

Feature

Description

🔑 Secure Authentication

Register using a college email address, verify through OTP, and log in securely.

📝 Multi-Step Registration

Complete personal, academic, contact, address, and document details.

📚 Semester Tracking

Add and manage semester-wise SGPA records.

📄 Resume Management

Maintain a resume link using Google Drive.

👤 Profile Dashboard

View and update profile information through dedicated sections and edit modals.

📊 Placement Tracking

Monitor placement status through the student dashboard.

🛡️ Admin / TPO Portal

Feature

Description

👥 Student Management

Search, filter, sort, and paginate student records.

✅ Profile Verification

Verify or reject student profiles.

📈 Placement Management

Update individual or multiple students' placement statuses.

🎓 Coordinator Management

Manually assign or unassign Student Coordinators and manage Faculty Coordinators.

📤 Data Export

Export selected student information to CSV or Excel (XLSX).

🏫 College Settings

Manage TPO head details, office information, and coordinator details.

🗑️ Bulk Operations

Delete multiple student records in a single operation.

🌐 Public Landing Page

Display college and Training & Placement Office information.

Showcase Faculty Coordinators and Student Coordinators.

Present Student Coordinator details in a responsive card-based layout.

Refresh coordinator information periodically and when the browser window regains focus.

🌟 What Makes This Project Stand Out?

<details>
<summary><strong>🎯 Manual Student Coordinator Assignment</strong></summary>

Administrators can select specific students from a list of unassigned students and assign them as Student Coordinators. This avoids automatic assignment and provides direct administrative control over coordinator selection.

</details>

<details>
<summary><strong>📊 Flexible CSV and Excel Export</strong></summary>

Administrators can choose the fields they need and generate CSV or XLSX reports. The export functionality supports formatted spreadsheet output and proper CSV escaping for reliable data handling.

</details>

<details>
<summary><strong>🔐 Layered Authentication and Authorization</strong></summary>

The application combines JWT authentication, password hashing, OTP verification, frontend route guards, and backend authorization middleware to protect student and administrative functionality.

</details>

<details>
<summary><strong>⚡ Efficient Database Access</strong></summary>

Prisma ORM is used to interact with MySQL. Relation loading and a layered backend structure help keep database operations organized and reduce unnecessary queries.

</details>

<details>
<summary><strong>📱 Responsive User Experience</strong></summary>

The interface uses custom CSS and reusable components, with responsive layouts, form validation, loading and empty states, toast notifications, and modal-based editing.

</details>

🛠️ Technology Stack

Layer

Technologies

Frontend

React 19, Vite

Routing

React Router v7

API Communication

Axios

Form Handling

React Hook Form

Icons

Lucide React

Styling

Custom CSS, responsive design

Backend

Node.js, Express.js 5

Database

MySQL

ORM

Prisma 6

Authentication

JSON Web Tokens (JWT), bcryptjs

Email & OTP

Nodemailer, Gmail SMTP

File Upload Handling

Multer

Spreadsheet Export

ExcelJS

CSV Export

Custom CSV generator

Development Tools

Git, GitHub, VS Code

## Architecture

The application follows a layered architecture with a clear separation between the frontend, API, business logic, and database.

flowchart TD
    A[Student / Admin / Visitor] --> B[React 19 + Vite]
    B --> C[React Router + Axios]
    C --> D[Express.js API]
    D --> E[Routes]
    E --> F[Controllers]
    F --> G[Services]
    G --> H[Prisma ORM]
    H --> I[(MySQL Database)]
    G --> J[Nodemailer / Gmail SMTP]
    G --> K[Multer / File Handling]
    G --> L[ExcelJS / CSV Export]

Request Flow

Frontend: React renders the interface and manages user interactions.

API communication: Axios sends HTTP requests, including JWT credentials where required.

Routes and middleware: Express routes requests through authentication, authorization, and relevant middleware.

Controllers: Controllers handle incoming requests and responses.

Services: Service functions implement business logic.

Database: Prisma communicates with MySQL to read or modify application data.

## Project Structure

tpo-portal/
│
├── frontend/
│   └── src/
│       ├── pages/          # Landing, authentication, student and admin pages
│       ├── components/     # Reusable UI components
│       ├── services/       # API service layer
│       └── utils/          # Validation and helper functions
│
├── backend/
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Authentication and upload middleware
│   │
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       ├── migrations/     # Database migrations
│       └── seed/           # Seed files, if configured
│
├── docs/                   # Project documentation
└── README.md

Note: The tree describes the main application structure. Actual files and folder names may vary slightly in your repository.

## Security

Security is incorporated into the authentication and request-handling flow.

Password hashing: bcryptjs hashes passwords before database storage.

JWT authentication: Stateless authentication with a seven-day token expiry.

Role-based access control: Separate permissions for Student and Admin roles.

OTP verification: Six-digit OTPs with a five-minute expiry for email verification and password reset.

Protected routes: Frontend route guards and backend authentication middleware restrict access to protected features.

Input validation: React Hook Form validates client-side input, supported by backend checks and database constraints.

File upload handling: Multer handles file-upload requests.

## Getting Started

Follow these steps to set up the project locally.

Prerequisites

Make sure the following are installed:

Node.js

MySQL

Git

npm (included with Node.js)

1. Clone the Repository

git clone <YOUR_REPOSITORY_URL>
cd tpo-portal

Replace <YOUR_REPOSITORY_URL> with your actual repository URL.

2. Install Dependencies

Install the frontend and backend dependencies separately.

cd frontend
npm install

Then:

cd ../backend
npm install

3. Configure the Database

Create a MySQL database for the application. For example:

CREATE DATABASE tpo_portal;

Configure the database connection using the environment variable expected by your Prisma schema.

4. Configure Environment Variables

Create the required .env file or files according to the configuration used in your frontend and backend.

See Environment Configuration below.

5. Run Prisma Migrations

From the backend directory, run the migration command appropriate for your project:

npx prisma migrate dev

If your repository uses a different database setup or an existing migration workflow, follow that configuration instead.

6. Start the Backend

From the backend directory:

npm run dev

7. Start the Frontend

Open another terminal:

cd frontend
npm run dev

Open the local URL printed by Vite in your terminal.

Important: The commands above assume your package scripts include dev. Check the scripts sections of both package.json files and adjust the commands if necessary.

## Environment Configuration

The application may require environment variables for database access, JWT signing, email delivery, and frontend API communication.

Typical configuration categories include:

Configuration

Purpose

MySQL connection URL

Connect Prisma to the database

JWT secret

Sign and verify authentication tokens

Gmail SMTP credentials

Send OTP emails

Frontend API base URL

Point the frontend to the backend API

Use the exact variable names expected by your application code and Prisma schema. Do not commit real passwords, SMTP credentials, JWT secrets, or other sensitive values to GitHub.

## Technical Highlights

Layered backend design: Separates routes, controllers, services, and database access.

Reusable frontend components: Keeps the UI consistent and easier to maintain.

Relation-aware data fetching: Uses Prisma relation loading where appropriate.

Paginated student management: Makes large student datasets easier to browse.

Configurable data exports: Allows administrators to export only the information they need.

Responsive design: Supports different screen sizes through custom CSS.

Improved feedback: Loading states, empty states, and toast notifications help users understand application status.

Coordinator synchronization: Public coordinator information refreshes periodically and on window focus.

## Future Enhancements

The following features could extend the portal's capabilities:

Company and recruiter management.

Placement drive scheduling and registration.

Student notifications and announcements.

Placement analytics dashboard with visual reports.

Resume parsing and skill extraction.

Interview-round tracking.

Advanced placement statistics and downloadable reports.

Automated email notifications for placement activities.

👥 Contributors

This project is developed collaboratively by:

Ritu Saini

Rakshita Dadhich

Contributions, suggestions, and feedback are welcome.
📄 License

This project was developed for an academic and institutional use case. Add an appropriate license if the repository is intended for public reuse; otherwise, specify the applicable ownership and usage terms.

<p align="center">
  <strong>🎓 TPO Portal</strong><br/>
  Simplifying campus placements through technology.
</p>