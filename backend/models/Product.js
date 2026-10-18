import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  shippingCharge: {
    type: Number,
    default: 0
  },
  mainCollection: {
    type: String,
enum: ["threads-of-aura", "colors-of-aura", "accessories", "bandhani", "navratri"],
    default: "threads-of-aura"
  },
  isNavratri: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ["men", "women", "couple", "unisex"]
  },
  subcategory: String,
  sizes: [String],
  images: [String],
  stock: Number
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
