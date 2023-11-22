import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Name is Required"]
    },
    email : {
        type:String,
        required: [true,"Email is Required"],
        unique:true
    },
    phone : {
        type: String,
        required:[true,"Phone Number is Required"],
    },
    dob: {
        type:Date , 
        required:true,
        validate: [validateDOB, 'Date of birth must be in the past'],
    },
    role:{
        type:String,
        enum: ['user', 'lsp', 'admin'],
        default: 'user',
        required:[true,"Role is required"]
    },
    password:{
        type:String,
        minlength:8,
        maxlength:15,
        required:[true,"Password is required"]
    },
    gender:{
        type: String,
        enum:['male','female','not specify'],
        required:true,
    },
    pic:{
        type:String,
        default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    location: {
        type: {
          type: String, 
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],       // array of [Longitude, latitude]
          required: true
        }
      },
      confirmPassword:{
        type:String,
        // required:[true,'Confirm Password is required'],
        validate: [validateConfirmPassword, "Passwords are not same"]
        },
      passwordChangedAt:Date,
      passwordResetToken:String,
      passwordResetTokenExpires:Date
} , { timestamps : true});


function validateDOB(dob) {
    // Check if the date of birth is in the past
    return dob <= new Date();
}

function validateConfirmPassword(cfrm) {
    // Check if the date of birth is in the past
    return cfrm === this.password;
}


userSchema.pre('save' , async function(next){                 //hashing the password before saving it to database
    if(!this.isModified){                                        // pre means before
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    this.confirmPassword = undefined;
})


userSchema.virtual('age').get(function() {
    // Calculate age based on the Date of Birth (dob)
    const currentDate = new Date();
    const birthDate = this.dob;
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    
    // If the current month is before the birth month or if it's the same month but the current date is before the birth date,
    // then subtract one year from the calculated age
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

userSchema.methods.getPasswordResetToken = async function(){
    // Generate a token that expires after 10 minutes
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires=Date.now()+10*60*1000;
    console.log(resetToken, this.passwordResetToken );
    return resetToken;

}

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}


const User = mongoose.model('User', userSchema);

export default User;