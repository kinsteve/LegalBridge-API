import UserModel from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../config/generateJWT.js';
import sendEmail from '../utils/email.js';
import twilio from 'twilio';
import generateOTP from '../config/generateOTP.js';
import otpModel from '../models/OtpSchema.js';
import LSPModel from '../models/LSP.js';


const registerUser = asyncHandler(async (req, res) => {
    try {
        const user = await UserModel.create(req.body);
        if (user) {
            res.status(201).json({
                _id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                voterId: user.voterId,
                phone: user.phone,
                dob: user.dob,
                age: user.age,
                gender: user.gender,
                password: user.password,
                pic: user.pic,
                location: user.location,
                address: user.address,
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
const registerLSP = asyncHandler(async (req, res) => {
    try {
        console.log("Running RegisterLSP");
        const lsp = await LSPModel.create(req.body);
        if (lsp) {
            res.status(201).json({
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
                startTime: lsp.startTime,
                endTime: lsp.endTime,
                token: generateToken(lsp._id),
                message: "LSP registered Successfully"
            });
        } else {
            res.status(400);
            throw new Error("Failed to Create the LSP")
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});

const emailCheck = (Model) => asyncHandler(async (req, res) => {
    const { email,voterId } = req.body;
    const voterRegex =  /^[A-Z]{3}[0-9]{7}$/;
    // Regex pattern to check the email format
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    if (!emailRegex.test(email)) {
        // If the provided email does not match the regex pattern
        res.status(400);
        throw new Error("Invalid Email format");
    }
    if (!voterRegex.test(voterId)) {
        // If the provided email does not match the regex pattern
        res.status(400);
        throw new Error("Invalid voterId format");
    }
    // const targetUser = await Model.findOne({ email });

    // if (targetUser) {
    //     // If the email is associated with another account
    //     res.status(400);
    //     throw new Error("This Email is associated with another account.");
    // } else {
    //     // If the email is valid and not associated with any account
    //     res.status(200).json({ message: "Valid Email" });
    // }
    const targetUserByEmail = await Model.findOne({ email });
    const targetUserByVoterId = await Model.findOne({ voterId });

    if (targetUserByEmail || targetUserByVoterId) {
        res.status(400);
        throw new Error("This Email/VoterID is associated with another account.");
    } else {
        res.status(200).json({ message: "Both Email and VoterId are unique."});
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { voterId, password } = req.body;
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
        res.status(401);
        throw new Error("Invalid VoterId or Password");
    }
});
const loginLSP = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
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
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const forgotPassword = (Model) => asyncHandler(async (req, res) => {
    const { email } = req.body;
    const targetUser = await Model.findOne({ email });

    if (!targetUser) {
        res.status(401);
        throw new Error('User is not registered with this email.');
    }

    // generate a random reset token and save it in the database
    const resetToken = await targetUser.getPasswordResetToken();
    console.log('Working', resetToken);

    await targetUser.save({ validateBeforeSave: false });
    const resetUrl = `https://legal-bridge-api.onrender.com/api/v1/auth/resetPassword/${resetToken}`;
    const message = `Below is the password reset link ${resetUrl}`;

    try {
        //Sending email,subject and message
        await sendEmail(targetUser.email, "Password reset", message);
        res.status(200).json({ message: "Reset link sent successfully to your registered mail." });
    } catch (err) {
        targetUser.passwordResetToken = undefined;
        targetUser.passwordResetTokenExpires = undefined;
        await targetUser.save({ validateBeforeSave: false });
        res.status(500)
        throw new Error('There was an error while sending an email');
    }
});

const resetPassword = (Model) => asyncHandler(async (req, res) => {
    const token = req.params.token;

    // Replace 'User' with the specified model dynamically
    const targetUser = await Model.findOne({
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!targetUser) {
        res.status(400);
        throw new Error('Token is invalid or has expired');
    }

    targetUser.password = req.body.password;
    targetUser.confirmPassword = req.body.confirmPassword;
    targetUser.passwordResetToken = undefined;
    targetUser.passwordResetTokenExpires = undefined;
    targetUser.passwordChangedAt = Date.now();
    await targetUser.save();

    console.log('Password has been reseted');
    res.status(200).json({ message: 'Password has been reseted' });
});

//PHONE NUMBER VERIFICATION

const sendOTP = asyncHandler(async (req, res) => {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const { phoneNumber } = req.body;
    const otp = generateOTP().toString();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);          // 5 minutes in milliseconds
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
            from: process.env.TWILIO_NUMBER,
            to: phoneNumber
        })
        .then(() => {
            res.status(200).json({ message: "OTP send Successfully." });
        })
        .catch((err) => {
            res.status(500);
            console.error(err);
            throw new Error(`Failed to send OTP`);
        })

});

const verifyOTP = asyncHandler(async (req, res) => {
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