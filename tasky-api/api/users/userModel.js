import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const Schema = mongoose.Schema;

// Password validation regex: min 8 chars, uppercase, lowercase, number, special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  password: {type: String, required: true }
});

// Validate password format on user creation/update
UserSchema.pre('save', async function() {
  const saltRounds = 12; // You can adjust the number of salt rounds
  
  if (this.isModified('password') || this.isNew) {
    try {
      // Check if new password meets requirements
      if (!passwordRegex.test(this.password)) {
        throw new Error(
          'Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character (@$!%*?&)'
        );
      }
      
      const hash = await bcrypt.hash(this.password, saltRounds);
      this.password = hash;
    } catch (error) {
      throw new Error(error);
    }
  } 
});

UserSchema.methods.comparePassword = async function (passw) { 
    return await bcrypt.compare(passw, this.password); 
};

UserSchema.statics.findByUserName = function (username) {
  return this.findOne({ username: username });
};

export default mongoose.model('User', UserSchema);