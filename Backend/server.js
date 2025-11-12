import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import projectRouter from "./routes/projectRoute.js";
import milestoneRouter from "./routes/milestoneRoute.js";
import timeTrackingRouter from "./routes/timeTrackingRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import initializeUsers from "./scripts/initUsers.js";

const app = express();
const port = process.env.PORT || 3000;

//Middleware
const allowedOrigins = process.env.FRONTEND_URL ? 
  [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'] : 
  ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

//Database Connection
connectDB().then(() => {
  // Initialize default users after DB connection
  initializeUsers();
});

//Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/projects", projectRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/time-tracking", timeTrackingRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=== PMS LOGIN CREDENTIALS ===');
    console.log('👑 Admin: admin@pms.com / admin12345');
    console.log('👔 Manager: manager@pms.com / manager123');
    console.log('👨💻 Employee: employee@pms.com / employee123');
    console.log('=============================\n');
  }
});
