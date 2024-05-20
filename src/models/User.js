import bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "crypto";
import { type } from "os";
import { ObjectId } from "mongodb";
import LSPModel from "./LSP.js";

const UserAddressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, "City is Required"],
  },
  state: {
    type: String,
    required: [true, "State is Required"],
  },
  pincode: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        // Validates whether 'v' is a 6-digit number
        return /^\d{6}$/.test(v.toString());
      },
      message: (props) => `${props.value} is not a valid 6-digit pincode!`,
    },
  }
});

const geoLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'], // This specifies that the type should be a Point
    required: true
  },
  coordinates: {
    type: [Number], // Specifies an array of numbers for the coordinates [longitude, latitude]
    required: true
  }
});

const slotSchema = new mongoose.Schema({
  lspId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'LSPModel',
    unique:true,
  },
  slot: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedAt: { type: Date, default: Date.now }
});


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase:true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please provide a valid email address",
      ],
    },
    voterId:{
      type: String,
      required:[true,'VoterID is Required'],
      unique:true,
      validate:{
        validator: function(value){
              return /^[A-Z]{3}[0-9]{7}$/.test(value);
        },
        message: ' Invalid VoterId Format'
       }
     },
    phone: {
      type: String,
      required: [true, "Phone Number is Required"],
      validate: {
        validator: function(value) {
        //this checks if it's a 10-digit number
          return /^\d{10}$/.test(value);
        },
        message: 'Invalid phone number format'
      }
    },
    dob: {
      type: Date,
      required: true,
      validate: [validateDOB, "Date of birth must be in the past"],
    },
    role: {
      type: String,
      default: "user",
    },
    password: {
      type: String,
      validate: [
        {
          validator: (value) =>
            /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,15}$/.test(value),
          message:
            "Password must contain at least one uppercase letter, one digit, and one special character, and be between 8 to 15 characters long",
        },
      ],
      required: [true, "Password is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "not specify"],
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://res.cloudinary.com/dmeer8vir/image/upload/v1700830965/roqfusjibr7xrzu4ygve.png",
    },
    address: UserAddressSchema,
    geoLocation: geoLocationSchema,
    bookedSlots:[slotSchema],
    confirmPassword: {
      type: String,
      // required:[true,'Confirm Password is required'],
      validate: [validateConfirmPassword, "Passwords are not same"],
    },
    
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    isRegister: {
      type:Boolean,
      default:false 
    }
  },
  { timestamps: true }
);

function validateDOB(dob) {
  // Check if the date of birth is in the past
  return dob <= new Date();
}

function validateConfirmPassword(cfrm) {
  // Check if the date of birth is in the past
  return cfrm === this.password;
}

userSchema.pre("save", async function (next) {
  //hashing the password before saving it to database
  if (!this.isModified('password')) {
    // pre means before
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;

  
  if(this.isRegister){
  const existingUser = await UserModel.findOne({
    $or: [{ email: this.email }, { voterId: this.voterId }],
  });


  if (existingUser) {
    const field = existingUser.email === this.email ? "Email" : "VoterId";
    const message = `${field} is already registered.`;
    const error = new Error(message);
    error.statusCode = 400;
    return next(error);
  }
  // this.isRegister = false;
}
  next()
});

userSchema.virtual("age").get(function () {
  // Calculate age based on the Date of Birth (dob)
  const currentDate = new Date();
  const birthDate = this.dob;
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();

  // If the current month is before the birth month or if it's the same month but the current date is before the birth date,
  // then subtract one year from the calculated age
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

userSchema.methods.getPasswordResetToken = async function () {
  // Generate a token that expires after 10 minutes
  const resetToken = crypto.randomBytes(32).toString("hex");

  // this.passwordResetToken = crypto
  //   .createHash("sha256")
  //   .update(resetToken)
  //   .digest("hex");
  this.passwordResetToken = resetToken;

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken );
  return resetToken;
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
