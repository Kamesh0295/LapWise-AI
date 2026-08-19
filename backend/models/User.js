const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is only required if not logged in via Google SSO
        return !this.googleId && this.authProvider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in query responses by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1672531100/default-avatar_v1883.png',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null/undefined values, but unique when present
      unique: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laptop',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare user password with input password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
