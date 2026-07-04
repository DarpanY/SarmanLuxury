const jwt =
require("jsonwebtoken")

const User =
require("../models/User")

/* PROTECT */

exports.protect =

async (req,res,next) => {

  let token

  /* CHECK TOKEN */

  if (

    req.headers.authorization

    &&

    req.headers.authorization
    .startsWith("Bearer")

  ) {

    try {

      token =

      req.headers.authorization
      .split(" ")[1]

      /* VERIFY */

      const decoded =

      jwt.verify(

        token,

        process.env.JWT_SECRET

      )

      /* GET USER */

      req.user =

      await User.findById(

        decoded.id

      )

      .select("-password")

      next()

    }

    catch (error) {

      console.log(error)

      res.status(401).json({

        message:
        "Not authorized"

      })

    }

  }

  /* NO TOKEN */

  if (!token) {

    res.status(401).json({

      message:
      "No token"

    })

  }

}

/* ADMIN */

exports.admin =

(req,res,next) => {

  if (

    req.user

    &&

    req.user.role === "admin"

  ) {

    next()

  }

  else {

    res.status(401).json({

      message:
      "Admin only"

    })

  }

}