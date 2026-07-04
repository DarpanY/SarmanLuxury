const User =
require("../models/User")

const bcrypt =
require("bcryptjs")

const jwt =
require("jsonwebtoken")

/* REGISTER */

exports.registerUser =
async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      password
    } = req.body

    const existingUser =
    await User.findOne({ email })

    if (existingUser) {

      return res.status(400)
      .json({
        message:
        "User already exists"
      })

    }

    const hashedPassword =
    await bcrypt.hash(password, 10)

    const user =
    await User.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword
    })

    res.status(201).json({

      message:
      "User registered successfully",

      user:{
        id:   user._id,
        name: user.name,
        email:user.email,
        phone:user.phone,
        role: user.role
      }

    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* LOGIN */

exports.loginUser =
async (req, res) => {

  try {

    const { email, password } =
    req.body

    const user =
    await User.findOne({ email })

    if (!user) {

      return res.status(400)
      .json({
        message:
        "Invalid credentials"
      })

    }

    const isMatch =
    await bcrypt.compare(
      password,
      user.password
    )

    if (!isMatch) {

      return res.status(400)
      .json({
        message:
        "Invalid credentials"
      })

    }

    const token =
    jwt.sign(

      { id:user._id, role:user.role },

      process.env.JWT_SECRET,

      { expiresIn:"7d" }

    )

    res.status(200).json({

      token,

      user:{
        id:   user._id,
        name: user.name,
        email:user.email,
        role: user.role
      }

    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* GET PROFILE */

exports.getProfile =
async (req, res) => {

  try {

    const user =
    await User.findById(req.user._id)
    .select("-password")

    if (!user) {
      return res.status(404)
      .json({ message:"User not found" })
    }

    res.status(200).json(user)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* UPDATE PROFILE */

exports.updateProfile =
async (req, res) => {

  try {

    const { name, phone } = req.body

    const user =
    await User.findById(req.user._id)

    if (!user) {
      return res.status(404)
      .json({ message:"User not found" })
    }

    if (name)  user.name  = name
    if (phone) user.phone = phone

    await user.save()

    res.status(200).json({

      message:"Profile updated",

      user:{
        id:   user._id,
        name: user.name,
        email:user.email,
        phone:user.phone,
        role: user.role
      }

    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* CHANGE PASSWORD */

exports.changePassword =
async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword
    } = req.body

    const user =
    await User.findById(req.user._id)

    const isMatch =
    await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isMatch) {

      return res.status(400)
      .json({
        message:
        "Current password is incorrect"
      })

    }

    user.password =
    await bcrypt.hash(newPassword, 10)

    await user.save()

    res.status(200).json({
      message:"Password changed successfully"
    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}
