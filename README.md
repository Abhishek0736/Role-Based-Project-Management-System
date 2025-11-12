# Project Management System (PMS)

A comprehensive role-based project management system built with Node.js, Express, React, and MongoDB.

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](./screenshots/PMS_1.png)

### Manager Dashboard
![Manager Dashboard](./screenshots/PMS_2.png)

### Employee Dashboard
![Employee Dashboard](./screenshots/PMS_3.png)

### Project Management
![Project Management](./screenshots/PMS_4.png)

### Task Management
![Task Management](./screenshots/PMS_5.png)

### Analytics Page
![Analytics Page](./screenshots/PMS_6.png)

## Features

- **Role-Based Access Control**: Admin, Manager, and Employee roles
- **Project Management**: Create, edit, and track projects
- **Task Management**: Assign and monitor tasks
- **Time Tracking**: Log and track work hours
- **Real-time Updates**: Live data synchronization
- **Modern UI**: Professional glassmorphism design

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React, Tailwind CSS, Vite
- **Authentication**: JWT (Access & Refresh tokens)
- **Icons**: Lucide React
- **Database**: MongoDB Atlas (Cloud)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pms-system.git
   cd pms-system
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Edit .env file with your database credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env
   # Edit .env file with your API URL
   npm run dev
   ```

4. **Database Setup**
   - Create MongoDB Atlas cluster
   - Get connection string from Atlas
   - Update .env file with MongoDB URI
   - Run the application to auto-create collections

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pms
JWT_SECRET=your_super_strong_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_32_chars_min
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Default Admin Account

After setup, create an admin account through the signup page or directly in the database.

## Security Features

- JWT-based authentication
- Role-based access control
- Environment variable protection
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is private and proprietary.

## Support

For support, contact [akabhi0736@gmail.com]
