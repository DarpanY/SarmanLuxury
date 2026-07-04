const Product =
require("../models/Product")

/* GET PRODUCTS */

exports.getProducts =
async (req, res) => {

  try {

    const keyword =

    req.query.search

    ?

    {

      name:{

        $regex:
        req.query.search,

        $options:"i"

      }

    }

    :

    {}

    const featuredFilter =

    req.query.featured

    ?

    {

      featured:true

    }

    :

    {}

    const bestSellerFilter =

    req.query.bestSeller

    ?

    {

      bestSeller:true

    }

    :

    {}

    const products =
    await Product.find({

      ...keyword,

      ...featuredFilter,

      ...bestSellerFilter

    })

    res.status(200).json(
      products
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* GET SINGLE PRODUCT */

exports.getProductById =
async (req, res) => {

  try {

    const product =
    await Product.findById(

      req.params.id

    )

    if (!product) {

      return res.status(404)
      .json({

        message:
        "Product not found"

      })

    }

    res.status(200).json(
      product
    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* CREATE PRODUCT */

exports.createProduct =

async (req,res) => {

  try {

    const {

      name,
      brand,
      section,
      productCategory,
      description,
      images,
      video,
      price,
      featured,
      bestSeller

    } = req.body

    const product =

    await Product.create({

      name,
      brand,
      section,
      productCategory,
      description,
      images,
      video,
      price,
      featured,
      bestSeller

    })

    res.status(201).json(
      product
    )

  }

  catch (error) {

    console.log(error)

    res.status(500).json({

      message:error.message

    })

  }

}

/* UPDATE PRODUCT */

exports.updateProduct =

async (req,res) => {

  try {

    const product =

    await Product.findById(

      req.params.id

    )

    if (!product) {

      return res.status(404)
      .json({

        message:
        "Product not found"

      })

    }

    product.name =
    req.body.name

    product.brand =
    req.body.brand

    product.section =
    req.body.section

    product.productCategory =
    req.body.productCategory

    product.description =
    req.body.description

    product.images =
    req.body.images

    product.video =
    req.body.video

    product.price =
    req.body.price

    product.featured =
    req.body.featured

    product.bestSeller =
    req.body.bestSeller

    const updatedProduct =

    await product.save()

    res.status(200).json(

      updatedProduct

    )

  }

  catch (error) {

    console.log(error)

    res.status(500).json({

      message:error.message

    })

  }

}

/* DELETE PRODUCT */

exports.deleteProduct =
async (req, res) => {

  try {

    await Product.findByIdAndDelete(

      req.params.id

    )

    res.status(200).json({

      message:
      "Product deleted"

    })

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* CREATE REVIEW */

exports.createReview =
async (req, res) => {

  try {

    const {

      rating,
      comment

    } = req.body

    const product =
    await Product.findById(

      req.params.id

    )

    if (!product) {

      return res.status(404)
      .json({

        message:
        "Product not found"

      })

    }

    const review = {

      user:req.user._id,

      name:req.user.name,

      rating:Number(rating),

      comment

    }

    product.reviews.push(
      review
    )

    product.numReviews =
    product.reviews.length

    product.rating =

    product.reviews.reduce(

      (acc, item) =>

        item.rating + acc,

      0

    )

    /

    product.reviews.length

    await product.save()

    res.status(201).json({

      message:
      "Review added"

    })

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

}

/* RELATED PRODUCTS */

exports.getRelatedProducts =

async (req,res) => {

  try {

    const product =

    await Product.findById(

      req.params.id

    )

    if (!product) {

      return res.status(404)
      .json({

        message:
        "Product not found"

      })

    }

    const relatedProducts =

    await Product.find({

      productCategory:

      product.productCategory,

      _id:{

        $ne:product._id

      }

    })

    .limit(4)

    res.status(200).json(

      relatedProducts

    )

  }

  catch (error) {

    res.status(500).json({

      message:error.message

    })

  }

} 