import mongoose from 'mongoose';

const consentLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    agreed: {
        type: Boolean,
        required: true
    },
    consentVersion: {
        type: String,
        default: "1.0"
    },
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ConsentLog = mongoose.model('ConsentLog', consentLogSchema);

export default ConsentLog;
