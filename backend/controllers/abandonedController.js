const Cart =
require("../models/Cart")

const Order =
require("../models/Order")

/* GET ABANDONED CARTS */
/* A cart is "abandoned" if it has items
   and was last updated > 1 hour ago
   and the user has no order in that window */

exports.getAbandonedOrders =
async (req, res) => {

  try {

    /* 1 HOUR AGO */

    const oneHourAgo =
    new Date(
      Date.now() - 60 * 60 * 1000
    )

    /* CARTS WITH ITEMS OLDER THAN 1HR */

    const abandonedCarts =
    await Cart.find({

      "items.0":{ $exists:true },

      updatedAt:{
        $lt:oneHourAgo
      }

    })

    .populate("user", "name email createdAt")

    .populate("items.product", "name price images")

    .sort({
      updatedAt:-1
    })

    /* CALCULATE VALUE */

    const enriched =
    abandonedCarts.map((cart) => {

      const cartValue =
      cart.items.reduce(

        (acc, item) =>

          acc + (

            (item.product?.price || 0) *
            item.quantity

          ),

        0

      )

      return {

        _id:cart._id,

        user:cart.user,

        items:cart.items,

        cartValue,

        abandonedAt:cart.updatedAt,

        itemCount:cart.items.length

      }

    })

    res.status(200).json(enriched)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* GET ABANDONED STATS */

exports.getAbandonedStats =
async (req, res) => {

  try {

    const oneHourAgo =
    new Date(
      Date.now() - 60 * 60 * 1000
    )

    const abandonedCarts =
    await Cart.find({

      "items.0":{ $exists:true },

      updatedAt:{
        $lt:oneHourAgo
      }

    })

    .populate("items.product", "price")

    const totalAbandoned =
    abandonedCarts.length

    const totalValue =
    abandonedCarts.reduce(

      (acc, cart) =>

        acc + cart.items.reduce(

          (sum, item) =>

            sum + (

              (item.product?.price || 0) *
              item.quantity

            ),

          0

        ),

      0

    )

    res.status(200).json({

      totalAbandoned,

      totalValue

    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}