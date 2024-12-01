
                                                              **File Manager Application**
                                                                  **Flow Description**
        1. **User Registration**
API Endpoint: POST http://localhost:3000/register
Purpose: Allows the user to register with the application by providing their credentials.
Response: Acknowledgment of successful user registration.
        **2. User Login**
API Endpoint: POST http://localhost:3000/login
Purpose: Enables the user to log in using their credentials.
Response: Provides a JWT token on successful authentication. This token is required for accessing all subsequent operations.
3. File Operations
All file operations require the JWT token to be included in the Authorization header as Bearer <token>.

          **Create a New File**
API Endpoint: POST http://localhost:3000/files
Purpose: Allows the user to create a new file. File data is sent in the request body.
Response: Returns the details of the newly created file.
          **Read All Files**
API Endpoint: GET http://localhost:3000/files
Purpose: Retrieves a list of all files created by the user.
Response: Returns an array of file objects.
          **Update a File**
API Endpoint: PUT http://localhost:3000/files/:fileId
Example: PUT http://localhost:3000/files/6740ad6c7bfcf8bc71e75f5d
Purpose: Updates the content or metadata of a specific file, identified by its fileId.
Response: Returns the details of the updated file.
          **Delete a File**
API Endpoint: DELETE http://localhost:3000/files/:fileId
Example: DELETE http://localhost:3000/files/6740ad6c7bfcf8bc71e75f5d
Purpose: Deletes a specific file identified by its fileId.
Response: Confirms the successful deletion of the file.
          **Access Flow**
Step 1: Register a user via the POST /register API.
Step 2: Log in with the POST /login API to receive a JWT token.
Step 3: Use the JWT token in the Authorization header for the following operations:
POST /files to create a file.
GET /files to read files.
PUT /files/:fileId to update a file.
DELETE /files/:fileId to delete a file.
