const Cart =
require("../models/Cart")

/* ADD TO CART */

exports.addToCart =
async (req, res) => {

  try {

    const {

      productId,
      quantity

    } = req.body

    let cart =

    await Cart.findOne({

      user:req.user._id

    })

    /* CREATE CART */

    if (!cart) {

      cart =
      new Cart({

        user:req.user._id,

        items:[]

      })

    }

    /* CHECK EXISTING */

    const existingItem =

    cart.items.find(

      (item)=>

        item.product.toString()

        ===

        productId

    )

    /* UPDATE */

    if (existingItem) {

      existingItem.quantity +=

      quantity || 1

    }

    else {

      cart.items.push({

        product:productId,

        quantity:
        quantity || 1

      })

    }

    await cart.save()

    /* POPULATE */

    const updatedCart =

    await Cart.findById(
      cart._id
    )

    .populate("items.product")

    res.status(200).json(
      updatedCart
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* GET CART */

exports.getCart =
async (req, res) => {

  try {

    const cart =

    await Cart.findOne({

      user:req.user._id

    })

    .populate("items.product")

    if (!cart) {

      return res.status(200)
      .json({

        items:[]

      })

    }

    res.status(200).json(
      cart
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* REMOVE ITEM */

exports.removeFromCart =
async (req, res) => {

  try {

    const cart =

    await Cart.findOne({

      user:req.user._id

    })

    if (!cart) {

      return res.status(404)
      .json({

        message:
        "Cart not found"

      })

    }

    cart.items =

    cart.items.filter(

      (item)=>

        item.product.toString()

        !==

        req.params.productId

    )

    await cart.save()

    const updatedCart =

    await Cart.findById(
      cart._id
    )

    .populate("items.product")

    res.status(200).json(
      updatedCart
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* UPDATE QUANTITY */

exports.updateQuantity =
async (req, res) => {

  try {

    const {

      action

    } = req.body

    const cart =

    await Cart.findOne({

      user:req.user._id

    })

    if (!cart) {

      return res.status(404)
      .json({

        message:
        "Cart not found"

      })

    }

    const item =

    cart.items.find(

      (item)=>

        item.product.toString()

        ===

        req.params.productId

    )

    if (!item) {

      return res.status(404)
      .json({

        message:
        "Item not found"

      })

    }

    if (action === "increase") {

      item.quantity += 1

    }

    if (

      action === "decrease"

      &&

      item.quantity > 1

    ) {

      item.quantity -= 1

    }

    await cart.save()

    const updatedCart =

    await Cart.findById(
      cart._id
    )

    .populate("items.product")

    res.status(200).json(
      updatedCart
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* CLEAR CART */

exports.clearCart =
async (req, res) => {

  try {

    const cart =

    await Cart.findOne({

      user:req.user._id

    })

    if (!cart) {

      return res.status(404)
      .json({

        message:
        "Cart not found"

      })

    }

    cart.items = []

    await cart.save()

    res.status(200).json({

      message:
      "Cart cleared"

    })

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}