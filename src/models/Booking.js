import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserModel', 
        required: true,
        },
    appointmentDate: {
        type: Date,
        required: true 
    },
    lspId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'LSPModel', 
        required: true,
    },
    selectedTime:{
        type: Date,
        required: true
    }
    }
);

const BookingModel = mongoose.model('Booking', BookingSchema);

export default BookingModel;



