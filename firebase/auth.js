const { admin } = require("./firebase");


const verifyToken = async(credential)=>{
    return new Promise(async (resolve,reject)=>{
        const id = credential.idToken;
        if(!id){
            reject("Token not found");
        }
        else{
            try {
                const check = await admin.auth().verifyIdToken(id);
                resolve(check)
            } catch (error) {
                console.log("google check error",error);
                reject("Invalid Token")
            }
        }
    })
}

module.exports = { verifyToken };