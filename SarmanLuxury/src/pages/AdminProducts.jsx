import "./styles/AdminProducts.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"

function AdminProducts() {

  const { token, user } = useAuth()
  const role = user?.role
  const navigate = useNavigate()

  const canDo = (action) => {
    const perms = {
      addProduct:    ["superadmin"],
      editProduct:   ["superadmin", "admin"],
      deleteProduct: ["superadmin"]
    }
    return perms[action]?.includes(role) ?? false
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const EMPTY_FORM = {
    name: "",
    brand: "",
    section: "Men",
    productCategory: "Shoes",
    description: "",
    price: "",
    images: [],
    video: "",
    featured: false,
    bestSeller: false
  }

  const [products,     setProducts]     = useState([])
  const [uploading,    setUploading]    = useState(false)
  const [editingId,    setEditingId]    = useState(null)
  const [formData,     setFormData]     = useState(EMPTY_FORM)
  const [searchQuery,  setSearchQuery]  = useState("")
  const [showAddForm,  setShowAddForm]  = useState(false)
  const [categoryOptions, setCategoryOptions] = useState([
    "Shoes","Watches","Bags","Clothing","Sunglasses","Perfume"
  ])

  useEffect(() => {
    API.get("/categories")
      .then(({ data }) => {
        if (data && data.length) {
          setCategoryOptions(data.map((c) => c.category))
        }
      })
      .catch(() => {})
  }, [])

  /* ── FETCH ── */

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products")
      setProducts(data)
    } catch {
      toast.error("Failed to load products")
    }
  }

  useEffect(() => { fetchProducts() }, [])

  /* ── HANDLERS ── */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const uploadImage = async (file) => {
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append("image", file)
      const { data } = await API.post("/upload", fd, authHeaders)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.image]
      }))
    } catch {
      toast.error("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  const uploadVideo = async (file) => {
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append("image", file)
      const { data } = await API.post("/upload", fd, authHeaders)
      setFormData((prev) => ({ ...prev, video: data.image }))
    } catch {
      toast.error("Video upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  /* ── SUBMIT ── */

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, formData, authHeaders)
        toast.success("Product updated")
      } else {
        await API.post("/products", formData, authHeaders)
        toast.success("Product added")
      }
      cancelForm()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    }
  }

  /* ── DELETE ── */

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await API.delete(`/products/${id}`, authHeaders)
      toast.success("Product deleted")
      fetchProducts()
    } catch {
      toast.error("Delete failed")
    }
  }

  /* ── OPEN EDIT FORM ── */

  const editProduct = (product) => {
    setEditingId(product._id)
    setShowAddForm(false)
    setFormData({
      name:            product.name,
      brand:           product.brand,
      section:         product.section,
      productCategory: product.productCategory,
      description:     product.description,
      price:           product.price,
      images:          product.images || [],
      video:           product.video  || "",
      featured:        product.featured,
      bestSeller:      product.bestSeller || false
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── CANCEL / CLOSE FORM ── */

  const cancelForm = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData(EMPTY_FORM)
  }

  const formVisible = editingId || showAddForm

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="admin-products-page">

      {/* ── HEADER ── */}

      <div className="admin-products-header">

        <button
          className="back-to-admin"
          onClick={() => navigate("/admin")}
        >
          ← ADMIN PANEL
        </button>

        <div className="admin-products-title">
          <span>SARMAN LUXURY</span>
          <h1>PRODUCT CMS</h1>
        </div>

        {canDo("addProduct") && !formVisible && (
          <button
            className="add-product-trigger"
            onClick={() => {
              setShowAddForm(true)
              setEditingId(null)
              setFormData(EMPTY_FORM)
            }}
          >
            + ADD PRODUCT
          </button>
        )}

      </div>

      {/* ── FORM (only visible when editing or adding) ── */}

      {formVisible && (
        <form className="admin-product-form" onSubmit={handleSubmit}>

          <div className="editing-banner">
            {editingId
              ? "✏️ EDITING PRODUCT"
              : "✚ NEW PRODUCT"
            }
            <span onClick={cancelForm}>✕ CLOSE</span>
          </div>

          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <select name="section" value={formData.section} onChange={handleChange}>
              <option>Men</option>
              <option>Women</option>
              <option>Accessories</option>
            </select>

            <select name="productCategory" value={formData.productCategory} onChange={handleChange}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              name="price"
              placeholder="Price (₹)"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <div className="featured-checkbox">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
            />
            <label htmlFor="featured">Featured Product</label>
          </div>

          <div className="featured-checkbox">
            <input
              type="checkbox"
              id="bestSeller"
              checked={formData.bestSeller}
              onChange={(e) =>
                setFormData({ ...formData, bestSeller: e.target.checked })
              }
            />
            <label htmlFor="bestSeller">Best Seller</label>
          </div>

          {/* IMAGES */}

          <div className="upload-box">
            <label>PRODUCT IMAGES</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                Array.from(e.target.files).forEach((f) => uploadImage(f))
              }
            />
            {uploading && <p className="uploading-text">Uploading...</p>}
            <div className="preview-grid">
              {formData.images.map((img, i) => (
                <div key={i} className="preview-wrap">
                  <img src={img} alt="Preview" className="upload-preview" />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={() => removeImage(i)}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEO */}

          <div className="upload-box">
            <label>PRODUCT VIDEO</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => uploadVideo(e.target.files[0])}
            />
            {formData.video && (
              <video src={formData.video} controls className="product-video-preview" />
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {editingId ? "UPDATE PRODUCT" : "ADD PRODUCT"}
            </button>
            <button type="button" className="cancel-btn" onClick={cancelForm}>
              CANCEL
            </button>
          </div>

        </form>
      )}

      {/* ── SEARCH ── */}

      <div className="products-search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span>{filtered.length} products</span>
      </div>

      {/* ── GRID ── */}

      <div className="admin-products-grid">

        {filtered.map((product) => (

          <div
            className={`admin-product-card ${editingId === product._id ? "editing" : ""}`}
            key={product._id}
          >

            <img src={product.images?.[0] || ""} alt={product.name} />

            <div className="admin-product-info">

              <span className="admin-section">{product.section}</span>

              <h3>{product.name}</h3>

              <p className="admin-brand">{product.brand}</p>

              <p className="admin-price">₹{product.price?.toLocaleString()}</p>

              <small>{product.productCategory}</small>

              {product.featured && (
                <span className="featured-badge">FEATURED</span>
              )}

              {product.bestSeller && (
                <span className="featured-badge bestseller-badge">BEST SELLER</span>
              )}

              <div className="image-count">
                {product.images?.length || 0} image{product.images?.length !== 1 ? "s" : ""}
              </div>

              <div className="admin-actions">

                {canDo("editProduct") && (
                  <button
                    className="edit-btn"
                    onClick={() => editProduct(product)}
                  >
                    EDIT
                  </button>
                )}

                {canDo("deleteProduct") && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(product._id)}
                  >
                    DELETE
                  </button>
                )}

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  )

}

export default AdminProducts
