# School Management System API

A web API designed to streamline and digitize school administrative processes, focusing on efficient API design, comprehensive data management, and advanced sorting capabilities. This API enables instructors to manage students, courses, and enrollments, with capabilities such as authentication, sorting algorithms, input validation, error handling, caching, and much more.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Domain Model](#domain-model)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Student Management](#student-management)
  - [Course Management](#course-management)
  - [Enrollment Management](#enrollment-management)
  - [Sort Endpoints](#sort-endpoints)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Development Considerations](#development-considerations)
  - [Validation](#validation)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
  - [Caching](#caching)
- [Performance Considerations](#performance-considerations)
- [Testing](#testing)
- [API Documentation](#api-documentation)

## Project Overview

The **School Management System API** provides a complete set of RESTful API endpoints to manage students, courses, enrollments, and instructors. Designed to handle core administrative functions, the API includes:

- Authentication for both students and instructors via JWT.
- CRUD operations for managing students, courses, and enrollments.
- Sorting endpoints to apply various algorithms to the student and course data.
- Extensive input validation and error handling.

---

## Features

- **CRUD Operations** for managing students, instructors, courses, and enrollments.
- **Filtering and Sorting** of courses and students.
- **JWT-based Authentication** for secure access control.
- **Error Handling** for clear and consistent error messages.
- **Input Validation** via Express-validator.
- **Caching Mechanisms** to improve performance.
- **Comprehensive Documentation** using Swagger UI.

---

## Domain Model

### Entities:
1. **Student** - Can view and manage own enrollments and courses.
2. **Instructor** - Full access to all operations (student creation, course management, etc.).
3. **Course** - A course offered by the institution.
4. **Enrollment** - Represents the relationship between students and courses.

### User Roles:
- **Student**: Limited permissions (access to personal data).
- **Instructor**: Full permissions (can manage all entities).

---

## API Endpoints

### Authentication Routes:
1. **POST /auth/login**: Login and receive a JWT token.
2. **POST /auth/password-reset**: Request for password reset email.

### Student Management:
1. **GET /students**: Retrieve all students (with filters). *Instructors only*.
2. **GET /students/{id}**: Get specific student details. *Self-access for students*.
3. **POST /students**: Create new student. *Instructors only*.
4. **PUT /students/{id}**: Update student data. *Self-access for students*.
5. **DELETE /students/{id}**: Remove student. *Instructors only*.

### Course Management:
1. **GET /courses**: List all courses with filtering options.
2. **GET /courses/{courseCode}**: Get details of a specific course.
3. **POST /courses**: Create a new course. *Instructors only*.
4. **PUT /courses/{courseCode}**: Update a course. *Instructors only*.
5. **DELETE /courses/{courseCode}**: Remove a course. *Instructors only*.

### Enrollment Management:
1. **POST /enrollments**: Enroll a student in a course.
2. **GET /enrollments/student/{studentId}**: Retrieve all courses for a student.
3. **GET /enrollments/course/{courseCode}**: Retrieve all students enrolled in a course.
4. **DELETE /enrollments/{enrollmentId}**: Cancel a specific enrollment. *Self-access for students*.

### Sort Endpoints:
1. **GET /sort/students**: Sort students based on criteria such as name, grade, etc.
2. **GET /sort/courses**: Sort courses based on criteria such as course code, title, etc.

---

## Setup
### Requirements
- **Docker Desktop**

### Environment Variables:
- Add the required  envs to the api service in the  compose.yaml file before running the project if you want to change any of the already existing envs

### Installing Dependencies:
Clone the repository and runing the project:

```bash
git clone https://github.com/emmanuelasidigbe/Student-Management-System-API.git
cd Student-Management-System-API
docker compose up
```



