# CRM System - Frontend & Backend

This is a complete CRM (Customer Relationship Management) system with a React frontend and Spring Boot backend.

## Quick Start

### Backend (Spring Boot)
1. Navigate to the `springapp` directory
2. Ensure MySQL is running on port 3306 with credentials `root/root1234`
3. Run the Spring Boot application:
   ```bash
   cd springapp
   ./mvnw spring-boot:run
   ```
4. The backend will start on `http://localhost:8080`

### Frontend (React)
1. Navigate to the `reactapp` directory
2. Install dependencies and start the development server:
   ```bash
   cd reactapp
   npm install
   npm start
   ```
3. The frontend will start on `http://localhost:8081`

## Authentication

**Important**: You must log in before accessing the dashboard or any other protected pages.

### Demo Credentials:
- **Admin**: username: `admin`, password: `admin123`
- **Sales Rep**: username: `sales`, password: `sales123`

## Troubleshooting Dashboard Loading Error

If you see the error "Network error - Could not connect to backend at http://localhost:8080", follow these steps:

1. **Check Backend Status**: Ensure the Spring Boot application is running on port 8080
2. **Login First**: Navigate to `/login` and authenticate with the demo credentials
3. **Check Authentication**: Verify you have a valid JWT token in localStorage
4. **Clear Browser Data**: If issues persist, clear localStorage and log in again

## API Endpoints

### Public Endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/validate` - Token validation

### Protected Endpoints (require JWT token):
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/interactions` - List interactions
- `POST /api/interactions` - Create new interaction

## Features

- **User Authentication**: JWT-based authentication system
- **Customer Management**: CRUD operations for customers
- **Interaction Tracking**: Record and manage customer interactions
- **Role-based Access Control**: Different permissions for Admin and Sales roles
- **Responsive Dashboard**: Real-time statistics and quick actions

## Technology Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Spring Boot 3, Spring Security, JWT
- **Database**: MySQL 8.0
- **Build Tools**: Maven (Backend), npm (Frontend)
