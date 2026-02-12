import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: "Guest Farmer"
    },
    role: {
        type: String,
        enum: ['farmer', 'expert', 'guest'],
        default: 'farmer'
    },
    profileImage: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
