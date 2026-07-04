const Contact =
require("../models/Contact")

/* SUBMIT MESSAGE (PUBLIC) */

exports.submitContact =
async (req, res) => {

  try {

    const {
      name,
      email,
      subject,
      message
    } = req.body

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {

      return res.status(400)
      .json({
        message:
        "All fields are required"
      })

    }

    const contact =
    await Contact.create({
      name,
      email,
      subject,
      message
    })

    res.status(201).json({
      message:
      "Message sent successfully",
      contact
    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* GET ALL MESSAGES (ADMIN) */

exports.getAllMessages =
async (req, res) => {

  try {

    const messages =
    await Contact.find()
    .sort({ createdAt:-1 })

    res.status(200).json(messages)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* MARK AS READ */

exports.markAsRead =
async (req, res) => {

  try {

    const contact =
    await Contact.findByIdAndUpdate(

      req.params.id,

      { isRead: true },

      { new:true }

    )

    if (!contact) {
      return res.status(404)
      .json({ message:"Message not found" })
    }

    res.status(200).json(contact)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* DELETE MESSAGE */

exports.deleteMessage =
async (req, res) => {

  try {

    await Contact.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({
      message:"Message deleted"
    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}
