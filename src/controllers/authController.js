import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../config/generateJWT.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

const register= asyncHandler(async (req,res)=>{
    const {name , email , password , role} = req.body;

        if(!name || !email || !password || !role){
            res.status(400);
            throw new Error("Please Enter all feilds");
        }
        const userExists = await User.exists({email:email});

        if(userExists){
            res.status(400);
            throw new Error("User already exists");
        }

        const user= await User.create(req.body);
        if(user){
            res.status(201).json({
                _id:user._id,
                role:user.role,
                name:user.name,
                email:user.email,
                phone:user.phone,
                dob: user.dob,
                age: user.age,
                gender:user.gender,
                password:user.password,
                pic:user.pic,
                location:user.location,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error("Failed to Create the User")
        }
});

const login = asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            role:user.role,
            name:user.name,
            email:user.email,
            phone:user.phone,
            dob: user.dob,
            age: user.age,
            gender:user.gender,
            pic:user.pic,
            location:user.location,
            token: generateToken(user._id)
        })
    } else{
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const forgotPassword = asyncHandler( async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error('User is not registered with this email.');
    }
  
    // generate a random reset token and save it in the database
    const resetToken = await user.getPasswordResetToken();
    console.log('Working',resetToken);
  
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:5000/api/v1/users/resetPassword/${resetToken}`;
    const message = `Below is the password reset link ${resetUrl}`;
  
    try {
        //Sending email,subject and message
      await sendEmail(user.email, "Password reset", message);
      res.status(200).json(user);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      throw new Error('There was an error while sending an email');
    }
})
const resetPassword = asyncHandler(async(req,res)=>{
// const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
const token =  crypto.createHash('sha256').update(req.params.token).digest('hex');
const user = await User.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt:Date.now()}});
if(!user){
    throw new Error('Token is invalid or has expired');
}
user.password = req.body.password;
user.confirmPassword = req.body.confirmPassword;
user.passwordResetToken=undefined;
user.passwordResetTokenExpires=undefined;
user.passwordChangedAt=Date.now();
await user.save();
console.log("updated");
res.status(200).send("Password has been reseted");

})

export {
    register,
    login,
    forgotPassword,
    resetPassword
};