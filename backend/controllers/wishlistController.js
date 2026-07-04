const Wishlist =
require("../models/Wishlist")

/* GET */

exports.getWishlist =
async (req, res) => {

  try {

    const wishlist =
    await Wishlist.findOne({

      user:req.user._id

    }).populate("products")

    res.status(200).json(

      wishlist || {

        products:[]

      }

    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* ADD */

exports.addToWishlist =
async (req, res) => {

  try {

    const {

      productId

    } = req.body

    let wishlist =
    await Wishlist.findOne({

      user:req.user._id

    })

    /* CREATE */

    if (!wishlist) {

      wishlist =
      await Wishlist.create({

        user:req.user._id,

        products:[productId]

      })

    }

    else {

      /* EXISTS */

      const exists =
      wishlist.products.includes(

        productId

      )

      if (!exists) {

        wishlist.products.push(

          productId

        )

      }

      await wishlist.save()

    }

    res.status(200).json(
      wishlist
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* REMOVE */

exports.removeWishlist =
async (req, res) => {

  try {

    const wishlist =
    await Wishlist.findOne({

      user:req.user._id

    })

    wishlist.products =
    wishlist.products.filter(

      (item) =>

        item.toString()

        !==

        req.params.productId

    )

    await wishlist.save()

    res.status(200).json(
      wishlist
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}