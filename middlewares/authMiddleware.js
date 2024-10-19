
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// #region auth Checke Middleware
const authMiddleware = asyncHandler(async (req, res, next)  => {
    let token;
    
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];

        try{
            if(token){
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decode?.id)
                req.user = user;
                next();
            }

        } catch(error){
            throw new Error('not Authorized token expired, please login again')
        }

    } else{
        throw new Error('There is no token attached to header')
    }
})

// const authMiddleware = asyncHandler(async (req, res, next) => {
//     let token;
//     if (req?.headers?.authorization?.startsWith('Bearer')) {
//       // Extract token
//       token = req.headers.authorization.split(' ')[1];
      
//       try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
//         // Find and attach user to request
//         req.user = await User.findById(decoded.id).select('-password'); // Exclude password
//         next();
//       } catch (error) {
//         // Differentiate expired token error
//         if (error.name === 'TokenExpiredError') {
//           return res.status(401).json({ message: 'Session expired. Please log in again.' });
//         }
//         res.status(401).json({ message: 'Invalid token. Authorization failed.' });
//       }
//     } else {
//       res.status(401).json({ message: 'No token provided in header.' });
//     }
//   });
  
//   module.exports = authMiddleware;
  

// #region isAdmin Middleware
const isAdmin = asyncHandler(async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email})
    if(adminUser.role !== 'admin'){
        throw new Error('Your are not an admin')
    }else{
        next();
    }

})


module.exports = {authMiddleware, isAdmin}