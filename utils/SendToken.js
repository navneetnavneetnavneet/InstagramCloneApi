module.exports.sendtoken = (user, statusCode, res) => {
  const token = user.getjwttoken();

  const options = {
    exipers: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, id: user._id, token });
};
