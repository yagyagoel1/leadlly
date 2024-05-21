# Leadlly

---

## Description:

This project implements RESTful APIs using Express.js and TypeScript, integrated with MongoDB as the database. It includes functionalities for user authentication using JSON Web Tokens (JWT), user management (register, login, logout, edit), and product management (create, get all).

---

## Features:

1. **User APIs:**
   - Register: Allows users to register by providing email, username, password, and full name.
   - Login: Enables users to log in with their registered credentials (email/username and password).
   - Logout: Logs out the authenticated user.
   - Edit: Allows users to edit their profile details such as username and full name.

2. **Product APIs:**
   - Create Product: Enables users to create new products by providing a name, description, and photo upload.
   - Get all Product: Retrieves all products from the database.

3. **Authentication:**
   - JSON Web Tokens (JWT) are used for authentication and authorization. Access tokens and refresh tokens are generated and managed securely.

4. **Middleware:**
   - Error Handling: Implements a custom async handler middleware to handle asynchronous functions and manage errors gracefully.
   - Authentication Middleware: Validates user authentication using JWT tokens.

5. **File Upload and Email Sending:**
   - Utilizes multer middleware for file upload (photo upload for product creation).
   - Implements nodemailer for sending emails (verification emails, password reset emails, etc.).
   - Integrates Cloudinary for file storage and management (uploading product photos).

6. **Validation:**
   - Utilizes Zod for data validation, including email, name, description, username, password, and OTP validation.

7. **Environment Variables:**
   - Uses dotenv for loading environment variables from the .env file, ensuring sensitive data is not exposed in the codebase.

8. **Docker:**
   - Docker support is added to containerize the application for easy deployment and scalability.

9. **Code Quality:**
   - Follows industry-standard coding practices and conventions.
   - Implements Prettier for code formatting, ensuring consistent and readable code.

---

## Challenges and Achievements:

- Integrating JWT for authentication required careful implementation to ensure secure token generation, validation, and handling of refresh tokens.
- Implementing file upload functionality with multer and Cloudinary required understanding file storage and management concepts and integrating them seamlessly with the application.
- Configuring nodemailer for sending emails involved setting up SMTP transport, handling email templates, and managing email sending errors and retries.
- Dockerizing the application was an achievement, providing containerization benefits such as portability, isolation, and scalability.
- Adding extra features like email sending and file upload improved the application's functionality and user experience, showcasing versatility and adaptability.

---

## Setup Instructions:

1. Clone the repository.
2. Create a `.env` file and add necessary environment variables according to the env.sample (e.g., MongoDB URI, JWT secrets, Cloudinary credentials, SMTP details, etc.).
3. Then run `sudo docker compose up`
4. or Run the application in development mode using `npm run dev` after running `npm install`.
5. Access the APIs using a REST client (e.g., Postman) at the specified endpoints.

---

## Contributors:

- Yagya Goel - yagyagoel87@gmail.com

---

