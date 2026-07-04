exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      })
    }

    /* Build a full, absolute URL so it works on localhost AND your live domain */
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    res.status(200).json({
      image: fileUrl
    })

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
