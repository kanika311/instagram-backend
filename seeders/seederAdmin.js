const User = require('../model/user');
const {USER_TYPES} = require('../constants/authConstant');

const seederAdmin = async() => {
  let admin = {
    email:'admin@techpyro.com',
    password:'12345678',
    userType: USER_TYPES.Admin
}

const user = await User.findOne({ email: admin?.email});
if (!user) {
  const admins = [
    new User(admin)
]
      admins.map(async (p, index) => {
        const result = await p.save()
      })
    } 
}

module.exports = seederAdmin