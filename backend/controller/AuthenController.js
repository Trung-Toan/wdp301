const User = require("../model/user/User");
const Account = require("../model/auth/Account");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Login bằng Google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // token từ FE gửi lên (Google ID Token)

    // Verify token với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    // Check user đã tồn tại chưa
    let user = await User.findOne({ email });

    if (!user) {
      // Nếu chưa có thì tạo mới user
      user = new User({
        fullname: name,
        email,
        password: null, // không cần password
        role: "user",
        googleId: sub, // lưu googleId
      });
      await user.save();
    }

    // Tạo JWT để FE lưu
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userRes = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      image: user.image,
      role: user.role,
    };

    res.status(200).json({
      message: "Login with Google success",
      token: accessToken,
      user: userRes,
    });
  } catch (error) {
    console.error(error);
    res
      .status(401)
      .json({ message: "Invalid Google token", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user
    const filter = {
      $or: [
        { email: username },
        { phone_number: username },
        { username: username },
      ],
    };
    const user = await User.findOne(filter);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // create new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn:  process.env.JWT_EXPIRES_IN,
    });

    const userRes = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      image: user.image,
      role: user.role,
    };

    res.status(200).json({ token, user: userRes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // check exited email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one lowercase, one uppercase, one number, and one special character!",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      role,
    });

    const createdUser = await newUser.save();
    res
      .status(201)
      .json({ message: "Create new user successfull!", user: createdUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error ", error: err.message });
  }
};

exports.findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const userRes = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      image: user.image,
      role: user.role,
    };
    res.status(200).json({ user: userRes });
  } catch (err) {
    res.status(500).json({ message: "Server error ", error: err.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { userId, password, rePassword } = req.body;
    if (password !== rePassword) {
      return res
        .status(400)
        .json({ message: "Password and repassword is not matching!" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one lowercase, one uppercase, one number, and one special character!",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cập nhật vào DB
    await User.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );
    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error ", error: err.message });
  }
};
