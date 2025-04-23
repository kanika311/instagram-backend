const mongoose = require("mongoose");
const seederAdmin = require("../seeders/seederAdmin");

const uri = process.env.DB_URL;

const dbConnection = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connection Successful:', uri);

        // Setup tasks (previously inside db.once)
        const db = mongoose.connection;


        // Call seederAdmin() after setup
        await seederAdmin();
        console.log('seederAdmin execution complete.');
        
    } catch (err) {
        console.error('Error:', err);
    }
};

module.exports = dbConnection;