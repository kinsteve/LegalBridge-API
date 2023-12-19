import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import crypto from "crypto";

const LSPAddressSchema = new mongoose.Schema({
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
    }
  },
  coordinates: {
    type: {
      lat: Number,
      long: Number,
    },
  },
});

const LSPEducationSchema = new mongoose.Schema({
  degree: String,
  college: String,
  passingYear: {
    type: Number, // Assuming the passing year is a number
    validate: {
      validator: function (value) {
        // Validate whether the passing year is before the current year
        return value <= new Date().getFullYear();
      },
      message: 'Passing year must be in the past or current year',
    }
}

});

const LSPSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    lowercase: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email address",
    ],
  },
  phone: {
    type: String,
    required: [true, "Phone Number is Required"],
    validate: {
      validator: function (value) {
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
  barID: {
    type: String,
    required: [true, "BarID is required"]
  },
  role: {
    type: String,
    default: "lsp"
  },
  typeOfLSP: {
    type: String,
    enum: ["advocate", "document writer", "arbitrators", "notaries", "mediators"],
    required: [true, "Type of LSP is required"],
    default: 'Lawyer'
  },
  experience: {
    type: Number,
    required: [true, "Experience is Required"]
  },
  expertiseField: {
    type: [String],
    required: [true, "Field of Expertise is required"]
  },
  courts: {
    type: [String]
  },
  rating: {
    type: Number,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 5;
      },
      message: 'Rating must be between 0 and 5',
    },
    default: 0, // You can set a default value if needed
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bio: {
    type: String,
  },
  languages: {
    type: [String],
  },
  location: LSPAddressSchema,
  education: [LSPEducationSchema],
  startTime: {
    type: Date,
    default: new Date().setHours(0, 0, 0, 0), // Default value 00:00
  },
  endTime: {
    type: Date,
    default: new Date().setHours(23, 59, 59, 999), // Default value 23:59
  },
  
  confirmPassword: {
    type: String,
    // required:[true,'Confirm Password is required'],
    validate: [validateConfirmPassword, "Passwords are not same"],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
}, { timestamps: true });

function validateDOB(dob) {
  // Check if the date of birth is in the past
  return dob <= new Date();
}


function validateConfirmPassword(cfrm) {
  // Check if the date of birth is in the past
  return cfrm === this.password;
}


LSPSchema.pre("save", async function (next) {
  //hashing the password before saving it to database
  if (!this.isModified) {
    // pre means before
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
});

LSPSchema.virtual("age").get(function () {
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


LSPSchema.methods.getPasswordResetToken = async function () {
  // Generate a token that expires after 10 minutes
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetToken = resetToken;

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken );
  return resetToken;
};

LSPSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const LSPModel = mongoose.model('LSP', LSPSchema);

export default LSPModel;