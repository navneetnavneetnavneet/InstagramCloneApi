const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      // required: [true, "FullName is required !"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required !"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required !"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minLength: [6, "Password should have atleast 6 characters"],
      maxLength: [15, "password should not exceed more than 15 characters"],
      // match: []
    },
    resetPasswordToken: {
      type: String,
      default: "0",
    },
    profileImage: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparepassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getjwttoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("user", userSchema);
