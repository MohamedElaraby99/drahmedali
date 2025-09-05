import app from "./app.js";
const PORT = process.env.PORT || 4007;
// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'https://almongz.online'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.almongz.online';

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    console.log(`production backend URL: ${process.env.BACKEND_URL}`);
    console.log(`production client URL: ${process.env.CLIENT_URL}`);
})