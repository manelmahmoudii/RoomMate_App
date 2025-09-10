# RoomMate TN Platform

This project is a comprehensive platform designed to connect students and advertisers for room rentals, featuring robust authentication, messaging, and administrative functionalities.

## Table of Contents
1.  [Project Overview](#project-overview)
2.  [Features](#features)
3.  [Technology Stack](#technology-stack)
    *   [Frontend](#frontend)
    *   [Backend](#backend)
    *   [Database](#database)
4.  [Setup Instructions](#setup-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Environment Variables](#environment-variables)
    *   [Database Setup](#database-setup)
    *   [Installation](#installation)
    *   [Running the Project](#running-the-project)
5.  [Project Structure](#project-structure)
6.  [Authentication & Authorization](#authentication--authorization)
7.  [Key Concepts](#key-concepts)
8.  [Deployment](#deployment)

## Project Overview

The RoomMate TN platform facilitates a seamless experience for students looking for accommodation and advertisers offering rooms. It includes:
*   Dynamic filtering for room searches.
*   Detailed listing pages with commenting and contact options.
*   User-specific dashboards (Student, Advertiser, Admin) with dynamic content.
*   Announcement creation and management.
*   Real-time messaging system with conversation grouping.
*   Robust authentication and role-based access control.

## Features

*   **User Authentication**: Secure login and signup with JWT.
*   **Role-Based Dashboards**: Separate dashboards for Students, Advertisers, and Admins with tailored functionalities.
*   **Dynamic Listing Search & Details**: Filterable room listings with comprehensive details, comments, and direct contact options for owners.
*   **Saved Listings**: Students can save favorite listings.
*   **Roommate Requests**: Students can send requests to listing owners.
*   **Announcement Management**: Users can create, view, and delete their own announcements. Admins can manage all announcements.
*   **Real-time Messaging**: "One conversation per user" messaging system with dynamic context and optimistic UI updates.
*   **Profile Management**: Users can view and update their profiles, including avatar uploads and preferences.
*   **Admin Panel**: Admins can manage users, listings, announcements, and reports.
*   **Responsive UI**: Fluid and animated interfaces across various devices using Tailwind CSS.
*   **Toast Notifications**: User-friendly, non-blocking notifications for all actions.

## Technology Stack

### Frontend
*   **Next.js**: React framework for server-side rendering, static site generation, and API routes.
*   **React**: JavaScript library for building user interfaces.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **Shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
*   **react-hot-toast**: For elegant and responsive toast notifications.
*   **Geist Fonts**: Custom fonts for a modern aesthetic.

### Backend
*   **Next.js API Routes**: For building RESTful APIs.
*   **Node.js**: JavaScript runtime environment.
*   **bcryptjs**: For hashing and comparing passwords securely.
*   **jsonwebtoken / jose**: For creating, signing, and verifying JSON Web Tokens (JWT) for authentication.

### Database
*   **MySQL**: Relational database management system.
*   **mysql2/promise**: MySQL client for Node.js with Promise API and connection pooling.

## Setup Instructions

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or Yarn
*   MySQL Server running locally or accessible remotely

### Environment Variables

Create a `.env.local` file in the root directory of the project and add the following environment variables:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=colocation_db
JWT_SECRET=a_long_random_string_for_jwt_signing
```
*   `DB_HOST`: Your MySQL database host (e.g., `localhost`).
*   `DB_USER`: Your MySQL database username (e.g., `root`).
*   `DB_PASSWORD`: Your MySQL database password.
*   `DB_NAME`: The name for your database (e.g., `colocation_db`).
*   `JWT_SECRET`: A strong, random string used to sign JWTs.

### Database Setup

1.  **Ensure MySQL is running.**
2.  **Initialize the database schema and a default admin user:**
    ```bash
    npm run db:init
    # or if using yarn
    yarn db:init
    ```
    This script will:
    *   Create the `colocation_db` database if it doesn't exist.
    *   Create all necessary tables (`users`, `listings`, `roommate_requests`, `favorites`, `comments`, `announcements`, `messages`).
    *   Create a default admin user with `email: admin@roommateTN.com` and `password: adminpassword`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd roommate-platform
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Add `"type": "module"` to `package.json`** (if not already present):

    This ensures that `ts-node` handles ES Modules correctly.

### Running the Project

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.

## Project Structure

*   `app/`: Next.js App Router structure.
    *   `api/`: Backend API routes (e.g., `api/auth`, `api/listings`, `api/messages`).
    *   `auth/`: Login and Signup pages.
    *   `dashboard/`: Role-specific dashboards (`student`, `advertiser`, `admin`).
    *   `components/`: Reusable React components (e.g., `HeaderClientWrapper`).
    *   `listings/[id]/`: Dynamic route for individual listing details.
    *   `layout.tsx`: Root layout, handling global elements like the `Toaster` and `HeaderClientWrapper`.
*   `lib/`: Utility functions.
    *   `auth.ts`: JWT encryption/decryption and session management.
    *   `db.ts`: MySQL database connection pooling and schema initialization.
    *   `types.ts`: TypeScript interfaces for consistent type definitions across the application.
    *   `fetchWithAuth.ts`: Client-side utility for authenticated API requests and logout redirection.
*   `public/`: Static assets (images, fonts).
    *   `uploads/`: Directory for user-uploaded images.
*   `scripts/`: Database initialization script.

## Authentication & Authorization

*   **JWT (JSON Web Tokens)**: Used for stateless authentication. Tokens are stored in HTTP-only cookies.
*   **Role-Based Access Control (RBAC)**: Implemented in `middleware.ts` to restrict access to routes and API endpoints based on user roles (`student`, `advertiser`, `admin`).
*   **Automatic Redirection**: Users are redirected to the login page upon token expiration or unauthorized access.

## Key Concepts

*   **Database Connection Pooling**: Implemented in `lib/db.ts` to efficiently manage and reuse database connections, preventing common `ER_CON_COUNT_ERROR` issues.
*   **Next.js Server and Client Components**: Strategic use of Server Components (`app/layout.tsx`) and Client Components (`app/components/HeaderClientWrapper.tsx`, dashboard pages) to optimize performance and manage data fetching.
*   **Optimistic UI Updates**: For actions like sending messages, the UI is updated immediately to provide a more responsive user experience, with server confirmation happening in the background.
*   **Centralized Error Handling**: `lib/fetchWithAuth.ts` automatically handles `401 Unauthorized` responses by initiating a logout and redirection.

## Deployment

The application is designed for deployment on **Vercel**. Ensure all environment variables are correctly configured in your Vercel project settings. The `middleware.ts` is crucial for handling authentication and routing in a serverless environment.
