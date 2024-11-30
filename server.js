require ('dotenv').config();

const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const userRouter = require('./routes/User');
const i18n = require('./config/i18n');
const middleware = require('i18next-http-middleware');
const cookieParser = require('cookie-parser');
const languageMiddleware = require('./middleware/languageMiddleware');
const { fileUploadQueue } = require('./config/queue');

const app = express();

// Middleware setup
app.use(cookieParser());
app.use(middleware.handle(i18n));
app.use(languageMiddleware);
app.use(express.json());

connectDB();

// Redis Queue Event Listeners
fileUploadQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

fileUploadQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

fileUploadQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

// Root route with language translation
app.get('/', (req, res) => {
  const welcomeMessage = req.t('Welcome to file Manager'); 
  res.send(welcomeMessage);
});

// Routes
app.use("/files", fileRoutes);
app.use('/', userRouter);

// Language routes
const languageRoutes = require('./routes/languageRoutes');
app.use('/api/language', languageRoutes);

// Upload routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/uploads', uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;