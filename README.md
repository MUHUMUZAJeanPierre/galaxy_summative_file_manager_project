# Multi-User File Manager Application

#### API Endpoints for Testing

- **File Management Endpoints**:
  - POST: `<http://localhost:3000/files>`
  - GET: `<http://localhost:3000/files>`
  - PUT: `<http://localhost:3000/files/:fileID>`
  - DELETE: `<http://localhost:3000/files/:fileID>`

- **File Queuing Endpoints**:
  - POST: `<http://localhost:3000/api/uploads/upload>`
  - GET: `<http://localhost:3000/api/uploads/status/:jobId>`

---

## Project Overview

This project is a backend application built with Node.js to demonstrate skills in database management, asynchronous task handling, internationalization, and unit testing. It simulates a collaborative file management system, enabling users to securely manage files, switch between languages, and handle background tasks seamlessly.

---

## Features

- **User Management:** Secure user registration and login with hashed passwords (bcrypt).  
- **File Management:** CRUD operations for managing files and directories.  
- **Multilingual Support:** Dynamic language switching using i18n.  
- **Asynchronous Task Handling:** Redis-based queuing system for file uploads and other background tasks.  
- **Unit Testing:** Comprehensive tests for core functionalities using Jest.  

---

## Technologies Used

- **Node.js & Express.js:** Backend framework for routing and server logic.  
- **MongoDB:** Flexible NoSQL database for storing user data, file metadata, and directory structures.  
- **Redis:** Reliable and efficient for managing asynchronous task queues.  
- **i18n (i18next):** Library for internationalization and localization.  
- **bcrypt:** Ensures secure password hashing.  
- **Bull Library:** Handles Redis queues, supporting retries and progress tracking.  
- **Jest:** Framework for writing unit tests.

---

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+ recommended)  
- MongoDB  
- Redis  

### Steps to Set Up

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repository.git
   cd multi-user-file-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:  
   Create a `.env` file in the root directory with the following keys:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/file_manager
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=your_jwt_secret
   ```

4. Start the application:

   ```bash
   npm start
   ```

5. Run tests:

   ```bash
   npm test
   ```

---

## API Endpoints

### User Management

- **POST <http://localhost:3000/register>:** Register a new user.  
  Example Payload:

  ```json
  {
    "username": "user"
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **POST <http://localhost:3000/login>:** Log in with email and password.  
  Example Payload:

  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

### File Management

- **GET <http://localhost:3000/files>:** List files in the user's directory.  
- **POST <http://localhost:3000/files>:** Upload a new file. Example Payload:

  ```json
  {
    "fileName": "example.txt",
    "content": "File content here."
  }
  ```

- **PUT <http://localhost:3000/files/:fileID>:** Update a file by specifying the `fileID` in the URL. Example Payload:

  ```json
  {
    "fileName": "updated-name.txt",
    "content": "Updated content here."
  }
  ```

- **DELETE <http://localhost:3000/files/:fileID>:** Delete a file by specifying the `fileID` in the URL.

---

## Challenges and Solutions

### Configuring Redis for High Concurrency

**Problem:**  
We faced difficulties configuring Redis to handle high concurrency efficiently, which impacted the reliability of task processing in scenarios with many simultaneous uploads.

**Solution:**  
We optimized the Redis task processing pipeline by:  

1. Adjusting the Redis maxmemory policy to prioritize eviction of less critical keys.  
2. Fine-tuning the Bull library configuration to increase concurrency settings.  
3. Monitoring and debugging queue delays using `bull-board`.

These changes significantly improved performance and ensured stable task execution under load.

---

## Future Enhancements

- Add file versioning.  
- Implement search functionality.  
- Integrate with a cloud storage service.  

---

## Contributors

- Jean Pierre MUHUMUZA - [j.muhumuza@alustudent.com](mailto:j.muhumuza@alustudent.com)  
- Nyiriek Peat - [n.peat@alustudent.com](mailto:n.peat@alustudent.com)
