const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        fullname: { type: String, required: true },
        phone: String,
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: String,
        image: { type: String, default: "https://scontent.fhan5-10.fna.fbcdn.net/v/t39.30808-6/482244628_621581180585396_2222308129965929091_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeH_10qz1p6ila8fVEH-aa_d7kk3mnZcWNTuSTeadlxY1H2k5xRvLmlGiVOKQwsyyPWdw7pTfs0wUYP5Iv24AAGD&_nc_ohc=mQUFBXj9SHsQ7kNvwGSXuIW&_nc_oc=Adlq7n3Vi1g63uGIlAd0kfigdVoWZCPVtgPm2l5jxKmN79YZBYfDuI-MQQ-hw3UgVWE&_nc_zt=23&_nc_ht=scontent.fhan5-10.fna&_nc_gid=ka-DisrkZ7DqGMU7HWVcwg&oh=00_AfZlAdp423tBU_9Er0khN0IudAn0tjv6yNMUeh0g_r2qug&oe=68C1A3B7" },
        role: {
            type: String,
            enum: ["customer", "owner", "admin"],
            required: true,
            default: "customer",
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;