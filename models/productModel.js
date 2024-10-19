const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // title: {


    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // slug: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    // },
    // description: {
    //   type: String,
    //   required: true,
    // },
    // price: {
    //   type: Number,
    //   required: true,
    // },
    // category: {
    //   type: String,
    //   required: true,
    // },
    // brand: {
    //   type: String,
    //   required: true,
    // },
    // quantity: {
    //   type: Number,
    //   required: true,
    // },
    // sold: {
    //   type: Number,
    //   default: 0,
    // },
    // images: [{
    //   public_id: String,
    //   url: String,
    // }],
    // color: {
    //   type: String,
    //   required: true,
    // },
    // tags: String,

    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],  // Array of ObjectIds
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    quantity: { type: Number, required: true },
    tags: { type: String, required: true },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
