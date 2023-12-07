import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../config/generateJWT.js';
import sendEmail from '../utils/email.js';
import twilio from 'twilio';
import generateOTP from '../config/generateOTP.js';
import otpModel from '../models/OtpSchema.js';


const register= asyncHandler(async (req,res)=>{
    const {name , email , password , role} = req.body;
        try {
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
                    address:user.address,
                    token: generateToken(user._id),
                    message: "User registered Successfully"
                });
            } else {
                res.status(400);
                throw new Error("Failed to Create the User")
            }
        } catch (error) {
                res.status(400);
               throw new Error(error.message);
        }
       
});

const emailCheck = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Regex pattern to check the email format
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    if (!emailRegex.test(email)) {
        // If the provided email does not match the regex pattern
        res.status(400);
        throw new Error("Invalid Email format");
    }

    const user = await User.findOne({ email });
    if (user) {
        // If the email is associated with another account
        res.status(400);
        throw new Error("This Email is associated with another account.");
    } else {
        // If the email is valid and not associated with any account
        res.status(200).json({ message: "Valid Email" });
    }
});


const login = asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.status(200).json({
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
            address:user.address,
            token: generateToken(user._id),
            message:"User LoggedIn successfully",
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
    res.status(401);
      throw new Error('User is not registered with this email.');
    }
  
    // generate a random reset token and save it in the database
    const resetToken = await user.getPasswordResetToken();
    console.log('Working',resetToken);
  
    await user.save({ validateBeforeSave: false });
    const resetUrl = `https://legal-bridge-api.onrender.com/api/v1/auth/resetPassword/${resetToken}`;
    const message = `Below is the password reset link ${resetUrl}`;
  
    try {
        //Sending email,subject and message
      await sendEmail(user.email, "Password reset", message);
      res.status(200).json({message : "Reset link sent successfully to your registered mail."});
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500)
      throw new Error('There was an error while sending an email');
    }
})

const resetPassword = asyncHandler(async(req,res)=>{
// const token =  crypto.createHash('sha256').update(req.params.token).digest('hex');
const token = req.params.token;
const user = await User.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt:Date.now()}});
if(!user){
    res.status(400);
    throw new Error('Token is invalid or has expired');
}
user.password = req.body.password;
user.confirmPassword = req.body.confirmPassword;
user.passwordResetToken=undefined;
user.passwordResetTokenExpires=undefined;
user.passwordChangedAt=Date.now();
await user.save();
console.log("updated");
res.status(200).json({message:"Password has been reseted"});

})

//PHONE NUMBER VERIFICATION

const sendOTP = asyncHandler(async(req,res)=>{
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    
    const {phoneNumber} = req.body;
    const otp = generateOTP().toString();
    const expirationTime  = new Date(); 
    expirationTime.setMinutes(expirationTime.getMinutes()+5);          // 5 minutes in milliseconds
    // console.log(expirationTime);
    const otpDocument = new otpModel({
        phoneNumber,
        otp,
        expirationTime
    })
    await otpDocument.save();

    await client.messages
    .create({
        body: `Your LegalBridge verification code is: ${otp}. This code will expire in 5 minutes.`,
        from:process.env.TWILIO_NUMBER,
        to: phoneNumber
    })
    .then(()=>{
        res.status(200).json({message : "OTP send Successfully."});
    })
    .catch((err)=>{
         res.status(500);
         console.error(err);
         throw new Error(`Failed to send OTP`);
    })

});

const verifyOTP = asyncHandler(async(req,res)=>{
    const {phoneNumber , userOTP} = req.body;
    
    try {
        const otpDocument = await otpModel.findOne({
            phoneNumber , 
            expirationTime: {$gt:new Date()}
        }).sort({expirationTime : -1});

         if(otpDocument && otpDocument.otp === userOTP){
            await otpDocument.deleteOne();
            res.status(200)
            .json({message : "OTP verified Successfully"});
         }else{
            res.status(400);
            throw new Error("Invalid OTP");
         }

    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error("Error Verifying the OTP");
    }
});



export {
    register,
    login,
    forgotPassword,
    resetPassword,
    emailCheck,
    sendOTP,
    verifyOTP
};