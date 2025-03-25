const User = require("../model/user");

const getUser = async(req, res) => {
  try {
      const { searchKey } = req.body;
      let page = 1;
      let limit = 10;

      if (req.query.page && Number(req.query.page) > 0) page = Number(req.query.page);
      if (req.query.limit && Number(req.query.limit) > 0) limit = Number(req.query.limit);

      if (!searchKey) {
          return res.badRequest({ message: "Insufficient request parameters! searchKey is required" });
      }

      const currentUserId = req.user._id; // Assuming the user's ID is stored in req.user._id

      const searchUser = await User.aggregate([
          {
              $match: {
                $or: [
                    { name: { $regex: searchKey, $options: "i" } },
                    { phone: { $regex: searchKey, $options: "i" } },
                    { username: { $regex: searchKey, $options: "i" } }
                ],
                _id: { $ne: req.user.id } // Exclude the current user
              }
          },
          {
              $addFields: {
                  isFollowing: { $in: [currentUserId, "$followers"] } // Check if the current user is following the searched user
              }
          },
          {
              $sort: {
                  isFollowing: -1, // Sort by following status first (1 for following, 0 for not following)
                  name: 1 // Optional: Sort alphabetically by name within the same following status
              }
          },
          {
              $group: {
                  _id: "$_id",
                  username: { $first: "$username" },
                  picture: { $first: { $cond: [{ $eq: ["$picture", null] }, null, "$picture"] } },
                  name: { $first: { $cond: [{ $eq: ["$name", null] }, null, "$name"] } },
                  Bio: { $first: { $cond: [{ $eq: ["$Bio", null] }, null, "$Bio"] } },
                  isFollowing: { $first: "$isFollowing" } // Include the following status in the output
              }
          },
          {
              $group: {
                  _id: null,
                  result: { $push: "$$ROOT" },
                  totalDocs: { $sum: 1 }
              }
          },
          {
              $project: {
                  _id: 0,
                  result: {
                      $slice: ["$result", limit * (page - 1), limit]
                  },
                  totalDocs: 1
              }
          }
      ]);

      if (!searchUser || searchUser.length == 0) {
          return res.recordNotFound();
      }

      return res.success({ data: searchUser[0] });

  } catch (error) {
      console.log(error);
      return res.internalServerError({ message: "Internal Server Error" });
  }
};


const checkUsername = async(req,res) => {
    try {
        let {searchKey} = req.body;
        
        if (searchKey.length < 3 || searchKey.length >= 30) {
          return res.validationError({ message: "Length of username should be greater than 2 and less than 30" });
      }
  
      // Assuming the username must contain only alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(searchKey)) {
        return res.validationError({ message: "username must contain only alphanumeric characters and underscores" });
      }

      const searchUser = await User.aggregate( [
        {
          $match: {username: {$regex: new RegExp('^' + searchKey + '$', 'i')}}
        },
        {
          $group: {
            _id: "$_id"
          }
        },
        
      ] )


      if(searchUser?.length==0 || !searchUser )
        return res.success({ data : {available: true} });

      return res.success({ message: "This username is not available" });

         
    } catch (error) {
        console.log(error);
        return res.internalServerError({ message: "Internal Server Error" });
    }
}

  

module.exports = {
    getUser,
    checkUsername
}