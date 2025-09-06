const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        // create new token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        const userRes = new User ({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            image: user.image,
            role: user.role
        })

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

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword, 
            role
        });

        const createdUser = await newUser.save();
        res.status(201).json({ message: "Create new user successfull!", user: createdUser })
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

exports.profile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error ", error: err.message });
    }
};
