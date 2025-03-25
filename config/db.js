const mongoose = require("mongoose")

const uri = process.env.DB_URL;

const dbConnection = ()=>{
    mongoose.connect(uri,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        console.log("mongoDB connection successFully",uri);
    }).catch((err)=>{
        console.log("Error in mongoDB connection", err);
    })
}

module.exports = dbConnection;