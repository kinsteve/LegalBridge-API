import UserModel from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../config/generateJWT.js';
import sendEmail from '../utils/email.js';
import twilio from 'twilio';
import generateOTP from '../config/generateOTP.js';
import otpModel from '../models/OtpSchema.js';
import LSPModel from '../models/LSP.js';
// import { createWalletController } from './moneyControllers.js';


const registerUser= asyncHandler(async (req,res,next)=>{
        try {
            req.body.isRegister = true;   
            const { dob, ...otherFields } = req.body;

            const newDob = new Date(dob);
        
            // Create a new object with the updated dob
            const updatedUserFields = {
              ...otherFields, // Keep other fields as they are
              dob: newDob,   // Set dob to the new date value
            };
            const user= await UserModel.create(updatedUserFields);
            if(user){
                // const walletCreationResponse = await createWalletController(req, res, next,user);
                // console.log(walletCreationResponse);
                // const storedDob= new Date(user.dob);

                res.status(201).json({
                    _id:user._id,
                    role:user.role,
                    name:user.name,
                    email:user.email,
                    voterId: user.voterId,
                    phone:user.phone,
                    dob: user.dob,
                    age: user.age,
                    gender:user.gender,
                    password:user.password,
                    pic:user.pic,
                    location:user.location,
                    geoLocation:user.geoLocation,
                    address:user.address,
                    isRegister:user.isRegister,
                    token: generateToken(user._id),
                    message: "User registered Successfully"
                });
               
            } else {
                const error = new Error("Failed to Create the User");
                error.statusCode = 400;
                throw(error)
            }
           
        } catch (error) {
               return next(error);
        }
});


const registerLSP = asyncHandler(async (req,res,next)=>{
        try {
            const lsp= await LSPModel.create(req.body);
            if(lsp){
                res.status(201).json({
                    _id:lsp._id,
                    name:lsp.name,
                    email:lsp.email,
                    phone:lsp.phone,
                    dob: lsp.dob,
                    password:lsp.password,
                    age: lsp.age,
                    gender:lsp.gender,
                    pic:lsp.pic,
                    barID:lsp.barID,
                    role:lsp.role,
                    typeOfLSP:lsp.typeOfLSP,
                    experience:lsp.experience,
                    expertiseFeild:lsp.expertiseField,
                    courts:lsp.courts,
                    rating:lsp.rating,
                    location:lsp.location,
                    geoLocation:lsp.geoLocation,
                    education:lsp.education,
                    token: generateToken(lsp._id),
                    message: "LSP registered Successfully"
                });
            } else {
                const error = new Error("Failed to Create the LSP");
                error.statusCode = 400;
                throw error;
            }
        } catch (error) {
               return next(error);
        }
});

const emailCheck = (Model) => asyncHandler(async (req, res, next) => {
    const { email, voterId } = req.body;
    const voterRegex = /^[A-Z]{3}[0-9]{7}$/;
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    try {
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid Email format");
            error.statusCode = 400;
            throw error;
        }

        if (!voterRegex.test(voterId)) {
            const error = new Error("Invalid voterId format");
            error.statusCode = 400;
            throw error;
        }

        const targetUserByEmail = await Model.findOne({ email });
        const targetUserByVoterId = await Model.findOne({ voterId });

        if (targetUserByEmail) {
            const error = new Error("This Email is associated with another account.");
            error.statusCode = 400;
            throw error;
        } else if (targetUserByVoterId) {
            const error = new Error("This VoterId is associated with another account.");
            error.statusCode = 400;
            throw error;
        } else {
            res.status(200).json({ message: "Both Email and VoterId are unique." });
        }
    } catch (error) {
       return next(error); // Transfer error to the error handling middleware
    }
});


const loginUser = asyncHandler(async (req, res,next) => {
    const { voterId, password } = req.body;
    try{
    const user = await UserModel.findOne({ voterId });
    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            age: user.age,
            gender: user.gender,
            pic: user.pic,
            location: user.location,
            address: user.address,
            token: generateToken(user._id),
            voterId:user.voterId,
            message: "User LoggedIn successfully",
        })
    } else {
        const error = new Error("Invalid VoterId or Password");
        error.statusCode = 401;
        throw(error);
    }
    }catch(error){
        return next(error);
    }
});
const loginLSP = asyncHandler(async (req, res,next) => {
    const { email, password } = req.body;
    try{
        const lsp = await LSPModel.findOne({ email });
        if (lsp && (await lsp.matchPassword(password))) {
        res.status(200).json({
            _id: lsp._id,
            name: lsp.name,
            email: lsp.email,
            phone: lsp.phone,
            dob: lsp.dob,
            password: lsp.password,
            age: lsp.age,
            gender: lsp.gender,
            pic: lsp.pic,
            barID: lsp.barID,
            role: lsp.role,
            typeOfLSP: lsp.typeOfLSP,
            experience: lsp.experience,
            expertiseFeild: lsp.expertiseField,
            courts: lsp.courts,
            rating: lsp.rating,
            location: lsp.location,
            education: lsp.education,
            token: generateToken(lsp._id),
            message: "LSP Loggedin Successfully"
        })
    } else {
        const error = new Error("Invalid Email or Password");
        error.statusCode = 401;
        throw(error);
    }
    }
    catch(error){
        return next(error);
    }
});

const forgotPassword = (Model) => asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;
        const targetUser = await Model.findOne({ email });

        if (!targetUser) {
            const error = new Error('User is not registered with this email.');
            error.statusCode = 401;
            throw error;
        }

        // Generate a random reset token and save it in the database
        const resetToken = await targetUser.getPasswordResetToken();
        console.log('Working', resetToken);

        await targetUser.save({ validateBeforeSave: false });

        let current = '';
        if (Model === UserModel) {
            current = 'user';
        } else {
            current = 'lsp';
        }
        const resetUrl = `https://legal-bridge-api.onrender.com/api/v1/auth/resetPassword/${current}/${resetToken}`;
        
        const message = `
        <!DOCTYPE html>
        <html lang="en">
       
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                /* CSS styles */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
       
                .container {
                    width: 80%;
                    margin: auto;
                    overflow: hidden;
                }
       
                header {
                    background: #fff;
                    color: #333;
                    padding: 20px 10px;
                    text-align: center;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                }
       
                .logo {
                    max-width: 150px;
                    margin: 0 auto;
                    display: block;
                }
       
                .content {
                    background: #fff;
                    padding: 20px;
                    margin-top: 20px;
                    border-radius: 5px;
                }
       
                p {
                    margin-bottom: 15px;
                }
       
                .reset-link {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
       
        <body>
            <header>
                <div class="container">
                    <img class="logo" src="https://legal-bridge-api.onrender.com/images/logo.png" alt="Your Logo">
                </div>
            </header>
            <div class="container">
                <div class="content">
                    <h2>Password Reset</h2>
                    <p>Dear User,</p>
                    <p>We have received a request to reset your password. Click the button below to reset it:</p>
                    <a href="${resetUrl}"
                        class="reset-link">Reset Password</a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>Thank you!</p>
                </div>
              </div>
        </body>
       
        </html>
        `;

        // Sending email, subject, and message
        await sendEmail(targetUser.email, "Password Reset", message);
        res.status(200).json({ message: "Reset link sent successfully to your registered mail." });
    } catch (err) {
        targetUser.passwordResetToken = undefined;
        targetUser.passwordResetTokenExpires = undefined;
        await targetUser.save({ validateBeforeSave: false });
       return next(err); // Pass the error to the error-handling middleware
    }
});


const resetPassword = (Model) => asyncHandler(async (req, res, next) => {
    try {
        const token = req.params.token;

        // Replace 'User' with the specified model dynamically
        const targetUser = await Model.findOne({
            passwordResetToken: token,
            passwordResetTokenExpires: { $gt: Date.now() },
        });

        if (!targetUser) {
            const error = new Error('Token is invalid or has expired');
            error.statusCode = 400;
            throw error;
        }

        targetUser.password = req.body.password;
        targetUser.confirmPassword = req.body.confirmPassword;
        targetUser.passwordResetToken = undefined;
        targetUser.passwordResetTokenExpires = undefined;
        targetUser.passwordChangedAt = Date.now();
        await targetUser.save();

        console.log('Password has been reset');
        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
     
        return next(err); // Pass the error to the error-handling middleware
    }
});


//PHONE NUMBER VERIFICATION

const sendOTP = asyncHandler(async (req, res, next) => {
    try {
        const accountSid = process.env.ACCOUNT_SID;
        const authToken = process.env.AUTH_TOKEN;
        const client = twilio(accountSid, authToken);

        const { phoneNumber } = req.body;
        const otp = generateOTP().toString();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 5);

        const otpDocument = new otpModel({
            phoneNumber,
            otp,
            expirationTime
        });

        await otpDocument.save();

        await client.messages
            .create({
                body: `Your LegalBridge verification code is: ${otp}. This code will expire in 5 minutes.`,
                from: process.env.TWILIO_NUMBER,
                to: phoneNumber
            })
            .then(() => {
                res.status(200).json({ message: "OTP sent Successfully." });
            })
            .catch((err) => {
                console.error(err);
                const error=new Error("Failed to send OTP");
                error.statusCode = 500;
                throw(error);
            });
    } catch (err) {
        // Pass the error to the next middleware with the customized message and status code
        return next(err);
    }
});

const verifyOTP = asyncHandler(async (req, res,next) => {
    const { phoneNumber, userOTP } = req.body;

    try {
        const otpDocument = await otpModel.findOne({
            phoneNumber,
            expirationTime: { $gt: new Date() }
        }).sort({ expirationTime: -1 });

        if (otpDocument && otpDocument.otp === userOTP) {
            await otpDocument.deleteOne();
            res.status(200)
                .json({ message: "OTP verified Successfully" });
        } else {
            const error = new Error('Invalid OTP');
            error.statusCode = 400;
            throw(error);
        }

    } catch (error) {
        return next(error);
    }
});



export {
    registerUser,
    registerLSP,
    loginUser,
    loginLSP,
    forgotPassword,
    resetPassword,
    emailCheck,
    sendOTP,
    verifyOTP
};