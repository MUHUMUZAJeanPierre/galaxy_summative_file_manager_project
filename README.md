# Multi-User File Manager Application

#### Before anything, here are the api endpoints we used when testing using postman

- POST:       <http://localhost:3000/files>
- GET:        <http://localhost:3000/files>
- PUT:        <http://localhost:3000/files/6740ad6c7bfcf8bc71e75f5d>
- DELETE:     <http://localhost:3000/files/6740ad6c7bfcf8bc71e75f5d>

<!-- File Queuing urls -->
POST: <http://localhost:3000/api/uploads/upload>
GET: <http://localhost:3000/api/uploads/status/:{jobId}>

## Project Overview  

This project is a backend application built with Node.js to demonstrate skills in database management, asynchronous task handling, internationalization, and unit testing. The application simulates a collaborative file management system, enabling users to securely manage files, switch between languages, and handle background tasks seamlessly.  

## Features  

- **User Management:** Secure user registration and login with hashed passwords (bcrypt).  
- **File Management:** CRUD operations for managing files and directories.  
- **Multilingual Support:** Dynamic language switching using i18n.  
- **Asynchronous Task Handling:** Redis-based queuing system for file uploads and other background tasks.  
- **Unit Testing:** Comprehensive tests for core functionalities using Jest.  

## Technologies Used  

- **Node.js & Express.js:** Backend framework for routing and server logic.  
- **MongoDB:** NoSQL database for storing user data, file metadata, and directory structures.  
- **Redis:** Used as a queuing system for handling asynchronous tasks efficiently.  
- **i18n (i18next):** Library for internationalization and localization.  
- **bcrypt:** For secure password hashing.  
- **Bull Library:** For managing Redis queues with features like retries and progress tracking.  
- **Jest:** Testing framework for unit tests.  

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

## API Endpoints  

### User Management  

- **POST <http://localhost:3000/register>:** Register a new user.  
- **POST <http://localhost:3000/login>:** Log in with email and password.  

### File Management  

- **GET <http://localhost:3000/files>:** List files in the user's directory.  
- **POST <http://localhost:3000/files>:** Upload a new file.  
- **PUT <http://localhost:3000/files/:fileID>:** Update a file (add the file ID).  
- **DELETE <http://localhost:3000/files/:fileID>:** Delete a file (Add the file Id at the end too).  

### Internationalization  

- **GET /api/language:** Get the current language.  
- **POST /api/language:** Change the language preference.  

### Queuing System  

- File uploads are managed asynchronously via Redis queues.  

## Future Enhancements  

- Add file versioning.  
- Implement search functionality.  
- Integrate with a cloud storage service.  

## Contributors  

- Jean Pierre MUHUMUZA - [j.muhumuza@alustudent.com](mailto:j.muhumuza@alustudent.com)
- Nyiriek Peat - [n.peat@alustudent.com](mailto:n.peat@sludtudent.com)  
