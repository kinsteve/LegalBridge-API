import mongoose from "mongoose";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const otpSchema = new mongoose.Schema({
     phoneNumber : {
        type:String,
        required: [ true , "Phone number is required"],
        validate: {
            validator: function (value) {
              // Parse the phone number
              const phoneNumber = parsePhoneNumberFromString(value, 'IN'); // 'IN' is the country code for India
          
              // Check if the parsed number is valid
              return phoneNumber && phoneNumber.isValid();
            },
            message: 'Invalid phone number format',
          }
     },
     otp:{
        type: String,
        require:[true , " OTP Required"]
     },
     expirationTime:{
        type: Date,
        required: true,
     }
});

const otpModel = mongoose.model('OTP' , otpSchema);

export default otpModel;