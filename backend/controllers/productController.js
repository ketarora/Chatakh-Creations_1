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
    // Query params can arrive as objects via ?category[$ne]=x — only ever
    // trust plain non-empty strings, everything else is ignored.
    const qstr = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    const mainCollection = qstr(req.query.mainCollection);
    const category = qstr(req.query.category);
    const subcategory = qstr(req.query.subcategory);
    const isNavratri = qstr(req.query.isNavratri);

    // Compose every condition as its own clause so nothing overwrites
    // anything else (previously navratri $or clobbered the threads $or).
    const clauses = [];
    if (mainCollection === "threads-of-aura") {
      clauses.push({
        $or: [
          { mainCollection: "threads-of-aura" },
          { mainCollection: { $exists: false } },
          { mainCollection: null },
          { mainCollection: "" },
        ],
      });
    } else if (mainCollection) {
      clauses.push({ mainCollection });
    }
    if (isNavratri === "true") {
      clauses.push({
        $or: [{ isNavratri: true }, { mainCollection: "navratri" }],
      });
    }
    if (category) clauses.push({ category });
    if (subcategory && subcategory !== "all") clauses.push({ subcategory });

    const filter = clauses.length ? { $and: clauses } : {};

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
    const updates = { ...req.body };
    // Normalise the flag so "false"/0 never sticks as a truthy string.
    if ("isNavratri" in updates) updates.isNavratri = Boolean(updates.isNavratri);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
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

