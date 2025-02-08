module.exports.sendToken = async (user, statusCode, res) => {
  const token = await user.generateAuthToken();

  const options = {
    exipers: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: true,
    // sameSite: "None",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, _id: user._id, token });
};
