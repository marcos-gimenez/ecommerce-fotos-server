import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

AdminSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

export default mongoose.model('Admin', AdminSchema);
