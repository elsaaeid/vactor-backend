const dotenv = require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const videosRoute = require("./routes/videosRoute");
const blogRoute = require("./routes/blogRoute");
const userRoute = require("./routes/userRoute");
const contactRoute = require("./routes/contactRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 8081;


const allowedOrigins = ["http://localhost:3000", "https://vactor.netlify.app"];

// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));
app.use(express.json()); // This makes sure Express can parse JSON bodies

// YouTube API route
app.use("/api/videos", videosRoute);
app.use("/api/playlists", videosRoute);
// Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/contactus", contactRoute);

// Proxy Middleware for YouTube API (if needed for other routes)
app.use('/youtube', createProxyMiddleware({
  target: 'https://www.googleapis.com',
  changeOrigin: true,
  pathRewrite: { '^/youtube': '' },
  onProxyRes: (proxyRes, req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      proxyRes.headers['Access-Control-Allow-Origin'] = origin;
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    }
  },
}));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


cloudinary.config({
  cloud_name : process.env.CLOUD_NAME,//process.env.CLOUDINARY_NAME
  api_key    : process.env.CLOUD_API_KEY,//process.env.CLOUDINARY_API_KEY
  api_secret : process.env.CLOUD_API_SECRET,//process.env.CLOUDINARY_API_SECRET
});



// Routes
// app.get("*", (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   res.send("Home Page");
// });

// Error Middleware
app.use(errorHandler);
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
