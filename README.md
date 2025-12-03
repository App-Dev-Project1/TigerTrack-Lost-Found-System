# TigerTrack: UST-CICS Lost & Found System

## Project Overview

**TigerTrack: UST-CICS Lost & Found System** is a web application designed to help users efficiently report lost and found items. The system provides three primary interfaces for different types of users:

- **Claimant’s Interface**: This interface includes the "I Lost an Item" form, where users can report an item they have lost by providing relevant details.
  
- **Retriever’s Interface**: This interface features the "I Found an Item" form, enabling users who have found an item to report it as belonging to someone else.

- **Tech Administrator’s Interface**: This interface is designed for administrators, allowing them to manage reported items. Key features include a dashboard for an overview of the system, sections for tracking items, viewing solved/claimed items, archived records, and a disputes section (yet to be implemented).

The application aims to simplify the process of reporting and retrieving lost items, ensuring a smooth experience for both claimants and finders while providing administrators with the necessary tools to manage the system effectively.

---

## Repository Structure

The repository is organized as follows:

```
/
├── backend/         ← Backend server code (API routes, authentication, database models, business logic)
├── public/          ← Static files (images, static assets, HTML files)
├── frontend/             ← Frontend source files (React components, styles, and state management)
├── .gitignore       ← Specifies intentionally untracked files to ignore
├── package.json     ← Frontend project metadata and dependency management
├── package-lock.json← Dependency lockfile for frontend
├── vite.config.js   ← Configuration file for Vite build tool
└── README.md        ← This file
```

---

## Setup & Installation

Follow the steps below to set up the project on your local machine for development.

### Prerequisites

Ensure the following software is installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- npm or yarn (for managing dependencies)
- [Backend prerequisites — e.g., database systems like PostgreSQL, MongoDB, etc.]  

### Frontend Installation

1. Navigate to the root directory of the repository:

    ```bash
    cd /path/to/tigertrack3
    ```

2. Install frontend dependencies using npm or yarn:

    ```bash
    npm install       # or `yarn install`
    ```

3. Start the development server for the frontend:

    ```bash
    npm run dev       # or `yarn dev`
    ```

   This will launch the frontend application on `http://localhost:3000/` (default port), or another port if configured differently.

### Backend Installation

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Install backend dependencies:

    ```bash
    npm install       # or `yarn install`
    ```

3. Configure any required environment variables (e.g., database URL, API keys). You may use a `.env` file for local environment variables.

4. Start the backend server:

    ```bash
    npm run dev       # or `yarn dev`
    ```

   The backend server should now be running, typically on `http://localhost:5000/` (or another port if configured).

---

## Key Features

Here is a list of key features provided by the application:

- **Claimant’s Interface**: Users can report a lost item through the "I Lost an Item" form, providing details about the missing item.
- **Retriever’s Interface**: Users who find an item can report it using the "I Found an Item" form, indicating that it does not belong to them.
- **Tech Administrator’s Interface**: Administrators can manage the items through a dashboard, track items, view solved/claimed records, archived entries, and manage disputes (though this feature is still under development).
- **Responsive Design**: The application is designed to be responsive and works seamlessly across devices and screen sizes, ensuring a positive user experience.

---

## Dependencies & Tech Stack

- **Frontend**: React + Vite + JavaScript, CSS/HTML  
- **Backend**: Supabase + Node.js  
- **Database**: [Specify database technology, e.g., PostgreSQL, MongoDB]  
- **Other Libraries**: [List any other major libraries, state-management, UI libraries, etc.]

---




