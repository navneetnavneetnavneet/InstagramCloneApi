const mongoose = require("mongoose");

// module.exports.connectDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL);
//     console.log(`Database Connection Established`);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

module.exports.connectDatabase = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/instaApi");
    console.log(`Database Connection Established`);
  } catch (error) {
    console.log(error.message);
  }
};
