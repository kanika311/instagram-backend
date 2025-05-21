const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

var admin = require("firebase-admin");

// Ensure private key is properly formatted
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const serviceAccount = {
    "type": "service_account",
    "project_id": "verify-16631",
    "private_key_id": process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
    "private_key": privateKey,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": "googleapis.com"
};

// Validate required environment variables
if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('Missing required Firebase credentials. Please check your .env file.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = { admin };