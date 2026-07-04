const mongoose =
require("mongoose")

const orderSchema =
new mongoose.Schema({

  user:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User",

    required:true

  },

  orderItems:[

    {

      product:{

        type:
        mongoose.Schema.Types.ObjectId,

        ref:"Product"

      },

      quantity:{

        type:Number,

        default:1

      }

    }

  ],

  shippingAddress:{

    fullName:String,

    phone:String,

    city:String,

    state:String,

    country:String,

    pincode:String,

    address:String

  },

  totalPrice:{

    type:Number,
    required:true

  },

  discountAmount:{

    type:Number,
    default:0

  },

  couponCode:{

    type:String,
    default:null

  },

  paymentMethod:{

    type:String,

    default:"COD"

  },

  paymentStatus:{

    type:String,

    enum:["Pending","Paid"],

    default:"Pending"

  },

  razorpayOrderId:{

    type:String

  },

  razorpayPaymentId:{

    type:String

  },

  orderStatus:{

    type:String,

    default:"Processing"

  }

}, {

  timestamps:true

})

module.exports =
mongoose.model(
  "Order",
  orderSchema
)