const User = require('../model/user');

// Send follow request or follow directly
const create = async (req, res) => {
    try {
        const { friendId } = req.body;

        // console.log(friendId,'firendID')

        // Validate request parameters
        if (!friendId) {
            return res.badRequest({ message: "friendId is required" });
        }

        // Check authentication
        if (!req.user) {
            return res.recordNotFound();
        }

        // Prevent self-follow
        if (req.user.id === friendId) {
            return res.badRequest({ message: "You cannot follow yourself" });
        }

        

        // Check if already following (using $in for more reliable check)
        const existingUser = await User.findOne({
            _id: req.user.id,
            following: { $in: [friendId] }
        });

       
        
        if (existingUser) {
            const userData = await User.findById(req.user.id)
                .populate('following', 'username name picture')
                .lean();
            
            return res.badRequest({ 
                message: "You already follow this user",
                data: {
                    following: userData.following
                }
            });
        }

        

        // Find the user to follow
        const userToFollow = await User.findOne({ 
            _id: friendId, 
            isDeleted: false 
        });

        

        if (!userToFollow) {
            return res.recordNotFound();
        }

        

        // Prepare response data
        let data = {
            follow_by_user: false,
            follower_of_user: req.user.followers.includes(friendId),
            request_by_user: false,
            blocked_user: false
        };

        

        // Check for existing request
        if (userToFollow.requestes?.includes(req.user.id)) {
            return res.badRequest({ 
                message: "You have already sent a follow request",
                data: data
            });
        }

        // Check for blocking
        if (req.user.blockedUser.includes(friendId) || 
            userToFollow.blockedUser.includes(req.user.id)) {
            return res.badRequest({ 
                message: "Action not allowed due to blocking",
                data: data
            });
        }
       

        // Handle private accounts
        if (userToFollow.isPrivate) {
            // Use $addToSet to prevent duplicates
            await User.findByIdAndUpdate(
                friendId,
                { $addToSet: { requestes: req.user.id } }
            );
            
            data.request_by_user = true;
            
            const updatedUser = await User.findById(req.user.id)
                .populate('requestes', 'username name picture')
                .lean();
            
            return res.success({ 
                message: "Follow request sent successfully",
                data:{
                    data,
                    userData: {
                        requests: updatedUser.requestes
                    }
                },
               
            });
        }

        

        // console.log('session')
        // Handle public accounts - use transactions for atomic updates
        try {
            await Promise.all([
              User.findByIdAndUpdate(req.user.id, {
                $addToSet: { following: friendId }
              }),
              User.findByIdAndUpdate(friendId, {
                $addToSet: { followers: req.user.id }
              })
            ]);
          
            data.follow_by_user = true;
          
            const updatedUser = await User.findById(req.user.id)
              .populate('following', 'username name picture')
              .lean();
          
            return res.success({
              message: "Successfully followed user",
              data: {
                data,
                userData: {
                  following: updatedUser.following
                }
              }
            });
          } catch (err) {
            console.error("❌ Follow error without transaction:", err);
            return res.internalServerError({ message: err.message });
          }
          

    } catch (error) {
        return res.internalServerError({ 
            message: "Error processing follow request check controller",
            error: error.message 
        });
    }
};

// Accept follow request
const reqAccept = async (req, res) => {
    try {
        const { friendId } = req.body;

        if (!friendId) {
            return res.badRequest({ message: "friendId is required" });
        }

        if (!req.user) {
            return res.recordNotFound();
        }

        if (req.user.id === friendId) {
            return res.badRequest({ message: "Cannot accept request from yourself" });
        }

        if (req.user.followers.includes(friendId)) {
            const userWithData = await User.findById(req.user.id)
                .populate('followers', 'username name picture')
                .populate('following', 'username name picture')
                .lean();
            
            return res.badRequest({ 
                message: "This user is already your follower",
                data: {
                    followers: userWithData.followers,
                    following: userWithData.following
                }
            });
        }

        const requestingUser = await User.findOne({ _id: friendId, isDeleted: false });
        if (!requestingUser) {
            return res.recordNotFound({ message: "Requesting user not found" });
        }

        let data = {
            follow_by_user: req.user.following.includes(friendId),
            follower_of_user: false,
            request_by_user: requestingUser.requestes?.includes(req.user.id),
            request_accept_user: false,
            blocked_user: false
        };

        if (!req.user.requestes?.includes(friendId)) {
            return res.badRequest({ 
                message: "Follow request not found or was already removed",
                data: data
            });
        }

        const updatedRequestes = req.user.requestes.filter(id => id.toString() !== friendId.toString());
        const updatedFollowers = [...req.user.followers, friendId];

        await User.findByIdAndUpdate(
            req.user.id,
            { 
                requestes: updatedRequestes,
                followers: updatedFollowers
            }
        );

        const updatedFollowing = [...requestingUser.following, req.user.id];
        await User.findByIdAndUpdate(
            friendId,
            { following: updatedFollowing }
        );

        data.request_accept_user = true;
        data.follower_of_user = true;

        const updatedUser = await User.findById(req.user.id)
            .populate('followers', 'username name picture')
            .populate('following', 'username name picture')
            .populate('requestes', 'username name picture')
            .lean();

        return res.success({ 
            message: "Follow request accepted successfully",
            data: data,
            userData: {
                followers: updatedUser.followers,
                following: updatedUser.following,
                pendingRequests: updatedUser.requestes
            }
        });

    } catch (error) {
        return res.internalServerError({ 
            message: "Error processing follow request",
            error: error.message 
        });
    }
};

// Reject follow request
const rejectRequest = async (req, res) => {
    try {
        const { friendId } = req.body;

        if (!friendId) {
            return res.badRequest({ message: "friendId is required" });
        }

        if (!req.user) {
            return res.recordNotFound();
        }

        if (!req.user.requestes.includes(friendId)) {
            return res.badRequest({ message: "No follow request found from this user" });
        }

        const updatedRequestes = req.user.requestes.filter(id => id.toString() !== friendId.toString());
        await User.findByIdAndUpdate(req.user.id, { requestes: updatedRequestes });

        const updatedUser = await User.findById(req.user.id)
            .populate('requestes', 'username name picture')
            .lean();

        return res.success({
            message: "Follow request rejected successfully",
            data: {
                pendingRequests: updatedUser.requestes
            }
        });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

// Cancel sent follow request
const cancelRequest = async (req, res) => {
    try {
        const { friendId } = req.body;

        if (!friendId) {
            return res.badRequest({ message: "friendId is required" });
        }

        const targetUser = await User.findOne({ _id: friendId, isDeleted: false });
        if (!targetUser) {
            return res.recordNotFound();
        }

        if (!targetUser.requestes.includes(req.user.id)) {
            return res.badRequest({ message: "No pending follow request to cancel" });
        }

        const updatedRequestes = targetUser.requestes.filter(id => id.toString() !== req.user.id.toString());
        await User.findByIdAndUpdate(friendId, { requestes: updatedRequestes });

        return res.success({
            message: "Follow request cancelled successfully"
        });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

// Unfollow a user
const unfollow = async (req, res) => {
    try {
        const { friendId } = req.body;
        console.log(req.user,'user')

        if (!friendId) {
            return res.badRequest({ message: "friendId is required" });
        }

        const followingIds = req.user.following.map(id => id.toString());
        if (!followingIds.includes(friendId.toString())) {
            return res.badRequest({ message: "You don't follow this user" });
        }

        // Remove from current user's following
        const updatedFollowing = req.user.following.filter(id => id.toString() !== friendId.toString());
        
        // Remove from target user's followers
        const targetUser = await User.findById(friendId);
        const updatedFollowers = targetUser.followers.filter(id => id.toString() !== req.user.id.toString());

        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { following: updatedFollowing }),
            User.findByIdAndUpdate(friendId, { followers: updatedFollowers })
        ]);

        const updatedUser = await User.findById(req.user.id)
            .populate('following', 'username name picture')
            .lean();

        return res.success({
            message: "Unfollowed successfully",
            data: {
                following: updatedUser.following
            }
        });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

// Get user's followers list
const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('followers', 'username name picture')
            .select('followers')
            .lean();

        if (!user) {
            return res.recordNotFound();
        }

        return res.success({ data: user.followers });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

// Get user's following list
const getFollowing = async (req, res) => {
    try {
        // First verify the user exists
        const userExists = await User.exists({ _id: req.user.id });
        if (!userExists) {
            return res.recordNotFound();
        }

        // Get the user with populated following
        const user = await User.findById(req.user.id)
            // .select('following')  // Select only the following field
            .populate('following', 'username name picture')
            .lean();  // Convert Mongoose document to plain object

        if (!user) {
            return res.recordNotFound();
        }

        console.log(user,'user')

        // Ensure following exists even if empty
        const following = user.following || [];

        let followingData = {
            data: user.following,
            count:following.length,
        }

        return res.success({ 
            data: followingData,
        });
    } catch (error) {
        return res.internalServerError({ 
            message: "Error retrieving following list",
            error: error.message 
        });
    }
};

// Get user's pending requests (for private accounts)
const getFollowRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('requestes', 'username name picture')
            .select('requestes')
            .lean();

        if (!user) {
            return res.recordNotFound();
        }

        return res.success({ data: user.requestes });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    create,
    reqAccept,
    rejectRequest,
    cancelRequest,
    unfollow,
    getFollowers,
    getFollowing,
    getFollowRequests
};