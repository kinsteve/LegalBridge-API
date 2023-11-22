import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../config/generateJWT.js';


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



export {
    register,
    login
};