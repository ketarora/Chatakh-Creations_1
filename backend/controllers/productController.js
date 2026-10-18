import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, mainCollection, category, subcategory, isNavratri } = req.body;

    if (!name || !description || price == null || stock == null || !mainCollection || !category) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0"
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      mainCollection,
      isNavratri: Boolean(isNavratri),
      category,
      subcategory,
      sizes: req.body.sizes || [],
      images: req.body.images || []
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const { mainCollection, category, subcategory, isNavratri } = req.query;

    const filter = {};
    if (mainCollection) {
      if (mainCollection === "threads-of-aura") {
        filter.$or = [
          { mainCollection: "threads-of-aura" },
          { mainCollection: { $exists: false } },
          { mainCollection: null },
          { mainCollection: "" }
        ];
      } else {
        filter.mainCollection = mainCollection;
      }
    }
    if (isNavratri === "true") {
      filter.$or = [
        { isNavratri: true },
        { mainCollection: "navratri" }
      ];
    }
    if (category) filter.category = category;
    if (subcategory && subcategory !== "all") filter.subcategory = subcategory;

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRODUCT (ADMIN)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PRODUCT (ADMIN)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

