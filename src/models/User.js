import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

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
      }
} , { timestamps : true});


function validateDOB(dob) {
    // Check if the date of birth is in the past
    return dob <= new Date();
}

userSchema.pre('save' , async function(next){                 //hashing the password before saving it to database
    if(!this.isModified){                                        // pre means before
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
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

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}


const User = mongoose.model('User', userSchema);

export default User;