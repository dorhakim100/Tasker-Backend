# 🛠️ Tasker Backend

Welcome to the **Tasker Backend**! This server powers the Tasker app and provides essential functionality for managing tasks and users. Built with 🟢 **Node.js**, the backend communicates with the frontend using REST API methods.

## 📊 Databases

The backend consists of two main databases:

- **Users**: Stores user information.
- **Tasks**: Stores tasks associated with each user.

## 🔐 Features

- **User Authentication**: Only authenticated users can manage tasks.
- **Task Ownership**: Users can add, edit, or delete tasks only if they are the task owners.
- **Smart Filtering**: Sends only the necessary tasks to the frontend, optimizing performance and data usage.

## 🌐 API Communication

The frontend and backend communicate using REST API methods, enabling:

- **User Registration & Login**: Manage user authentication.
- **Task Management**: Create, read, update, delete tasks.
- **Task Filtering**: Return only tasks relevant to the current user, filtered by custom logic.

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tasker-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd tasker-backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run start
   ```

## 🖥️ Environment Variables

Make sure to set up the following environment variables:

- `PORT`: Port on which the server will run.

## 📡 API Endpoints

### User Routes

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Authenticate and log in a user.

### Task Routes

- `GET /api/task`: Get tasks for the authenticated user with filtering.
- `POST /api/task`: Create a new task (User authentication required).
- `PUT /api/task/:id`: Edit a task if the user is the owner.
- `DELETE /api/task/:id`: Delete a task if the user is the owner.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

This backend is crucial for enabling the seamless functioning of the **Tasker** application by ensuring secure and efficient task management.
