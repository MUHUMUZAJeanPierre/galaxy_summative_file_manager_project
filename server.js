const express = require("express");
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const  userRouter = require('./routes/User')
const i18n = require('./config/i18n');
const middleware = require('i18next-http-middleware');

const app = express();
app.use(middleware.handle(i18n));
app.use(express.json());

connectDB();
app.get('/', (req, res) => {
  const welcomeMessage = req.t('welcome'); 
  res.send(welcomeMessage);
});

app.use("/files", fileRoutes);
app.use('/', userRouter)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
