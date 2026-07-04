const User =
require("../models/User")

const Product =
require("../models/Product")

const Order =
require("../models/Order")

const Cart =
require("../models/Cart")

const Contact =
require("../models/Contact")

/* DASHBOARD STATS */

exports.getDashboardStats =
async (req, res) => {

  try {

    const totalUsers =
    await User.countDocuments()

    const totalProducts =
    await Product.countDocuments()

    const totalOrders =
    await Order.countDocuments()

    const orders =
    await Order.find()

    const totalRevenue =
    orders.reduce(
      (acc, order) =>
        acc + order.totalPrice,
      0
    )

    const recentOrders =
    await Order.find()
    .populate("user")
    .sort({ createdAt:-1 })
    .limit(5)

    const unreadMessages =
    await Contact.countDocuments({
      isRead:false
    })

    /* ABANDONED CARTS COUNT */

    const cutoff =
    new Date(
      Date.now() - 24 * 60 * 60 * 1000
    )

    const allCarts =
    await Cart.find({
      "items.0":{ $exists:true }
    })

    /* USERS WHO ORDERED IN LAST 24H */

    const recentOrderUserIds =
    await Order.distinct("user", {
      createdAt:{ $gte:cutoff }
    })

    const abandonedCount =
    allCarts.filter(

      (cart) =>

        !recentOrderUserIds
        .some(

          (id) =>

            id.toString() ===
            cart.user.toString()

        )

    ).length

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      unreadMessages,
      abandonedCarts:abandonedCount
    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* GET ALL USERS */

exports.getAllUsers =
async (req, res) => {

  try {

    const users =
    await User.find()
    .select("-password")
    .sort({ createdAt:-1 })

    res.status(200).json(users)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* UPDATE USER ROLE */

exports.updateUserRole =
async (req, res) => {

  try {

    const user =
    await User.findByIdAndUpdate(

      req.params.id,

      { role:req.body.role },

      { new:true }

    )
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

/* DELETE USER */

exports.deleteUser =
async (req, res) => {

  try {

    await User.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({
      message:"User deleted"
    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* GET ALL ORDERS (ADMIN) */

exports.getAllOrders =
async (req, res) => {

  try {

    const orders =
    await Order.find()
    .populate("user", "name email")
    .populate(
      "orderItems.product",
      "name images price"
    )
    .sort({ createdAt:-1 })

    res.status(200).json(orders)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* UPDATE ORDER STATUS */

exports.updateOrderStatus =
async (req, res) => {

  try {

    const order =
    await Order.findByIdAndUpdate(

      req.params.id,

      { orderStatus:req.body.orderStatus },

      { new:true }

    )

    if (!order) {
      return res.status(404)
      .json({ message:"Order not found" })
    }

    res.status(200).json(order)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* ABANDONED CARTS */

exports.getAbandonedCarts =
async (req, res) => {

  try {

    /* CARTS WITH ITEMS */

    const cartsWithItems =
    await Cart.find({
      "items.0":{ $exists:true }
    })
    .populate("user", "name email createdAt")
    .populate("items.product", "name images price")

    /* USERS WHO PLACED ORDER RECENTLY */

    const cutoff =
    new Date(
      Date.now() - 24 * 60 * 60 * 1000
    )

    const recentOrderUserIds =
    await Order.distinct("user", {
      createdAt:{ $gte:cutoff }
    })

    /* FILTER OUT ACTIVE BUYERS */

    const abandoned =
    cartsWithItems.filter(

      (cart) =>

        cart.user &&

        !recentOrderUserIds
        .some(

          (id) =>

            id.toString() ===
            cart.user._id.toString()

        )

    )

    res.status(200).json(abandoned)

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}

/* ═══════════════════════════════
   ANALYTICS (SUPERADMIN ONLY)
═══════════════════════════════ */

exports.getAnalytics =
async (req, res) => {

  try {

    const now = new Date()

    /* ── TIME BOUNDARIES ── */

    const startOfToday =
    new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const startOf7Days =
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const startOf30Days =
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const startOfLastMonth =
    new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const endOfLastMonth =
    new Date(now.getFullYear(), now.getMonth(), 0)

    /* ── REVENUE ── */

    const allOrders =
    await Order.find()
    .populate("orderItems.product", "productCategory section price")

    const totalRevenue =
    allOrders.reduce(
      (a, o) => a + o.totalPrice, 0
    )

    const revenueToday =
    allOrders
    .filter(o => o.createdAt >= startOfToday)
    .reduce((a, o) => a + o.totalPrice, 0)

    const revenue7Days =
    allOrders
    .filter(o => o.createdAt >= startOf7Days)
    .reduce((a, o) => a + o.totalPrice, 0)

    const revenue30Days =
    allOrders
    .filter(o => o.createdAt >= startOf30Days)
    .reduce((a, o) => a + o.totalPrice, 0)

    const revenueLastMonth =
    allOrders
    .filter(o =>
      o.createdAt >= startOfLastMonth &&
      o.createdAt <= endOfLastMonth
    )
    .reduce((a, o) => a + o.totalPrice, 0)

    /* ── ORDERS BY STATUS ── */

    const ordersByStatus =
    await Order.aggregate([
      {
        $group:{
          _id:"$orderStatus",
          count:{ $sum:1 },
          revenue:{ $sum:"$totalPrice" }
        }
      }
    ])

    /* ── REVENUE BY DAY (last 30 days) ── */

    const revenueByDay =
    await Order.aggregate([
      {
        $match:{
          createdAt:{ $gte:startOf30Days }
        }
      },
      {
        $group:{
          _id:{
            $dateToString:{
              format:"%Y-%m-%d",
              date:"$createdAt"
            }
          },
          revenue:{ $sum:"$totalPrice" },
          orders:{ $sum:1 }
        }
      },
      { $sort:{ _id:1 } }
    ])

    /* ── REVENUE BY MONTH (last 12 months) ── */

    const startOf12Months =
    new Date(now.getFullYear() - 1, now.getMonth(), 1)

    const revenueByMonth =
    await Order.aggregate([
      {
        $match:{
          createdAt:{ $gte:startOf12Months }
        }
      },
      {
        $group:{
          _id:{
            $dateToString:{
              format:"%Y-%m",
              date:"$createdAt"
            }
          },
          revenue:{ $sum:"$totalPrice" },
          orders:{ $sum:1 }
        }
      },
      { $sort:{ _id:1 } }
    ])

    /* ── TOP PRODUCTS ── */

    const topProducts =
    await Order.aggregate([
      { $unwind:"$orderItems" },
      {
        $group:{
          _id:"$orderItems.product",
          totalSold:{ $sum:"$orderItems.quantity" },
          totalRevenue:{
            $sum:{
              $multiply:[
                "$orderItems.quantity",
                "$totalPrice"
              ]
            }
          }
        }
      },
      { $sort:{ totalSold:-1 } },
      { $limit:5 },
      {
        $lookup:{
          from:"products",
          localField:"_id",
          foreignField:"_id",
          as:"product"
        }
      },
      { $unwind:"$product" },
      {
        $project:{
          name:"$product.name",
          image:{ $arrayElemAt:["$product.images",0] },
          category:"$product.productCategory",
          price:"$product.price",
          totalSold:1,
          totalRevenue:1
        }
      }
    ])

    /* ── SALES BY CATEGORY ── */

    const salesByCategory =
    await Order.aggregate([
      { $unwind:"$orderItems" },
      {
        $lookup:{
          from:"products",
          localField:"orderItems.product",
          foreignField:"_id",
          as:"prod"
        }
      },
      { $unwind:"$prod" },
      {
        $group:{
          _id:"$prod.productCategory",
          totalSold:{ $sum:"$orderItems.quantity" },
          revenue:{
            $sum:{
              $multiply:[
                "$orderItems.quantity",
                "$prod.price"
              ]
            }
          }
        }
      },
      { $sort:{ revenue:-1 } }
    ])

    /* ── SALES BY SECTION ── */

    const salesBySection =
    await Order.aggregate([
      { $unwind:"$orderItems" },
      {
        $lookup:{
          from:"products",
          localField:"orderItems.product",
          foreignField:"_id",
          as:"prod"
        }
      },
      { $unwind:"$prod" },
      {
        $group:{
          _id:"$prod.section",
          totalSold:{ $sum:"$orderItems.quantity" },
          revenue:{
            $sum:{
              $multiply:[
                "$orderItems.quantity",
                "$prod.price"
              ]
            }
          }
        }
      },
      { $sort:{ revenue:-1 } }
    ])

    /* ── PAYMENT METHODS ── */

    const paymentMethods =
    await Order.aggregate([
      {
        $group:{
          _id:"$paymentMethod",
          count:{ $sum:1 },
          revenue:{ $sum:"$totalPrice" }
        }
      }
    ])

    /* ── NEW USERS BY DAY ── */

    const newUsersByDay =
    await User.aggregate([
      {
        $match:{
          createdAt:{ $gte:startOf30Days }
        }
      },
      {
        $group:{
          _id:{
            $dateToString:{
              format:"%Y-%m-%d",
              date:"$createdAt"
            }
          },
          count:{ $sum:1 }
        }
      },
      { $sort:{ _id:1 } }
    ])

    /* ── USER GROWTH ── */

    const totalUsers =
    await User.countDocuments()

    const newUsersToday =
    await User.countDocuments({
      createdAt:{ $gte:startOfToday }
    })

    const newUsers7Days =
    await User.countDocuments({
      createdAt:{ $gte:startOf7Days }
    })

    const newUsers30Days =
    await User.countDocuments({
      createdAt:{ $gte:startOf30Days }
    })

    /* ── TOP CITIES ── */

    const topCities =
    await Order.aggregate([
      {
        $group:{
          _id:"$shippingAddress.city",
          orders:{ $sum:1 },
          revenue:{ $sum:"$totalPrice" }
        }
      },
      { $match:{ _id:{ $ne:null, $ne:"" } } },
      { $sort:{ orders:-1 } },
      { $limit:5 }
    ])

    /* ── AVG ORDER VALUE ── */

    const avgOrderValue =
    allOrders.length > 0
      ? totalRevenue / allOrders.length
      : 0

    res.status(200).json({

      revenue:{
        total:    totalRevenue,
        today:    revenueToday,
        last7:    revenue7Days,
        last30:   revenue30Days,
        lastMonth:revenueLastMonth
      },

      orders:{
        total:  allOrders.length,
        avgValue: avgOrderValue,
        byStatus: ordersByStatus,
        byDay:    revenueByDay,
        byMonth:  revenueByMonth
      },

      products:{
        top:         topProducts,
        byCategory:  salesByCategory,
        bySection:   salesBySection
      },

      users:{
        total:   totalUsers,
        today:   newUsersToday,
        last7:   newUsers7Days,
        last30:  newUsers30Days,
        byDay:   newUsersByDay
      },

      payments: paymentMethods,
      topCities

    })

  }

  catch (error) {

    res.status(500).json({
      message:error.message
    })

  }

}
