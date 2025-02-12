const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "FullName is required !"],
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
      type: Object,
      default: {
        fileId: "",
        url: "https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png",
        fileType: "",
      },
    },
    bio: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    savePosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "story" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = async function () {
  return await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("user", userSchema);
