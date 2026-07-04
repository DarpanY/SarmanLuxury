const mongoose =
require("mongoose")

/* REVIEW */

const reviewSchema =
new mongoose.Schema({

  user:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User"

  },

  name:String,

  rating:Number,

  comment:String

}, {

  timestamps:true

})

/* PRODUCT */

const productSchema =
new mongoose.Schema({

  name:{

    type:String,

    required:true

  },

  brand:{

    type:String,

    required:true

  },

  /* SECTION */

  section:{

    type:String,

    required:true

  },

  /* PRODUCT CATEGORY */

  productCategory:{

    type:String,

    required:true

  },

  description:{

    type:String,

    required:true

  },

  /* MULTIPLE IMAGES */

  images:[

    {

      type:String

    }

  ],

  /* VIDEO */

  video:{

    type:String,

    default:""

  },

  /* PRICE */

  price:{

    type:Number,

    required:true

  },

  /* FEATURED */

  featured:{

    type:Boolean,

    default:false

  },

  /* BEST SELLER */

  bestSeller:{

    type:Boolean,

    default:false

  },

  /* REVIEWS */

  reviews:[reviewSchema],

  numReviews:{

    type:Number,

    default:0

  },

  rating:{

    type:Number,

    default:0

  }

}, {

  timestamps:true

})

module.exports =
mongoose.model(

  "Product",

  productSchema

)