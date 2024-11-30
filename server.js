const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const userRouter = require('./routes/User');
const i18n = require('./config/i18n');
const middleware = require('i18next-http-middleware');
const cookieParser = require('cookie-parser');
const languageMiddleware = require('./middleware/languageMiddleware'); 

const app = express();

// Middleware setup
app.use(cookieParser()); // Add cookie parser
app.use(middleware.handle(i18n)); // i18next middleware
app.use(languageMiddleware); // Custom language middleware
app.use(express.json());

connectDB();

// Updated root route with language translation
app.get('/', (req, res) => {
  const welcomeMessage = req.t('Welcome to file Manager'); 
  res.send(welcomeMessage);
});

// Routes
app.use("/files", fileRoutes);
app.use('/', userRouter);

// Optional: Add language routes
const languageRoutes = require('./routes/languageRoutes');
app.use('/api/language', languageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;