const Category = require("../models/Category")

/* PUBLIC — get all visible categories */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category
      .find({ isVisible: true })
      .sort({ order: 1, createdAt: 1 })
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — get ALL categories */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category
      .find()
      .sort({ order: 1, createdAt: 1 })
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — create category */
exports.createCategory = async (req, res) => {
  try {
    const { title, category, image, isVisible, order } = req.body

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category key are required" })
    }

    const existing = await Category.findOne({ category })
    if (existing) {
      return res.status(400).json({ message: "Category key already exists" })
    }

    const newCategory = await Category.create({
      title,
      category,
      image:      image     || "",
      isVisible:  isVisible !== undefined ? isVisible : true,
      order:      order     || 0
    })

    res.status(201).json(newCategory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — update category */
exports.updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!cat) return res.status(404).json({ message: "Category not found" })
    res.status(200).json(cat)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — delete category */
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Category deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
