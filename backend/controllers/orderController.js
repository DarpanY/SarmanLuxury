const Order =
require("../models/Order")

const Cart =
require("../models/Cart")

/* PLACE ORDER */

exports.placeOrder =
async (req, res) => {

  try {

    const {

      shippingAddress,
      paymentMethod,
      couponCode,
      discountAmount,
      totalPrice: overrideTotal

    } = req.body

    /* FIND CART */

    const cart =
    await Cart.findOne({

      user:req.user._id

    }).populate("items.product")

    if (

      !cart ||

      cart.items.length === 0

    ) {

      return res.status(400)
      .json({

        message:
        "Cart is empty"

      })

    }

    /* TOTAL */

    const totalPrice =

    cart.items.reduce(

      (acc, item) =>

        acc +

        (

          item.product.price *

          item.quantity

        ),

      0

    )

    /* CREATE ORDER */

    const order =
    await Order.create({

      user:req.user._id,

      orderItems:
      cart.items.map((item) => ({
        product:  item.product._id,
        quantity: item.quantity
      })),

      shippingAddress,

      paymentMethod,

      totalPrice:     overrideTotal ?? totalPrice,

      discountAmount: discountAmount || 0,

      couponCode:     couponCode || null,

      paymentStatus:  "Pending"

    })

    /* INCREMENT COUPON USAGE */

    if (couponCode) {
      const Coupon = require("../models/Coupon")
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      )
    }

    /* CLEAR CART */

    cart.items = []

    await cart.save()

    res.status(201).json(order)

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* USER ORDERS */

exports.getMyOrders =
async (req, res) => {

  try {

    const orders =
    await Order.find({

      user:req.user._id

    })

    .populate("orderItems.product")

    .sort({

      createdAt:-1

    })

    res.status(200).json(
      orders
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* ADMIN ORDERS */

exports.getAllOrders =
async (req, res) => {

  try {

    const orders =
    await Order.find()

    .populate("user")

    .populate("orderItems.product")

    .sort({

      createdAt:-1

    })

    res.status(200).json(
      orders
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}