const User =  require("../model/user");

const checkUser = async(req,res,next)=>{
    try {
        if(!req.params.username || !req.params.searchBy){
            return res.badRequest({message : "Insufficient request parameters! username and searchBy is required"}) 
        }
        if(req.params.username === req.params.searchBy){
            next();
        }

        let query = {
            username: req.params.username
        }

        

    } catch (error) {
        console.log("error in middleware/user/checkUser",error);
        return res.unAuthorized({ message: error.message });
    }
}

module.exports = {
    checkUser
};
