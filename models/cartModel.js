
// // const mongoose = require('mongoose');

// // const cartSchema = new mongoose.Schema({
// //     userId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "User"
// //     },
// //     productId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "Product"
// //     },
// //     quantity: {
// //         type: Number,
// //         required: true
// //     },
// //     price: {
// //         type: Number,
// //         required: true
// //     },
// //     color: {
// //         type: String,
// //         ref: "Color"
// //     }
// // },{timestamps: true});


// // module.exports = mongoose.model("Cart", cartSchema)


// const mongoose = require("mongoose");

// // const cartItemSchema = new mongoose.Schema({
// //   product: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "Product",
// //     required: true,
// //   },
// //   color: {
// //     type: String,
// //     required: true,
// //   },
// //   quantity: {
// //     type: Number,
// //     required: true,
// //   },
// //   price: {
// //     type: Number,
// //     required: true,
// //   },
// // });

// // const cartSchema = new mongoose.Schema({
// //   userId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "User",
// //     required: true,
// //   },
// //   products: [cartItemSchema],
// //   cartTotal: {
// //     type: Number,
// //     required: true,
// //   },
// //   orderBy: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "User",
// //     required: true,
// //   },
// // }, { timestamps: true });

// const CartSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
//   totalPrice: { type: Number, required: true },
//   cartTotal: { type: Number, required: true }, // Example field
//   orderBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Example field
// });

// const Cart = mongoose.model('Cart', CartSchema);

// module.exports = Cart;
// // module.exports = mongoose.model("Cart", cartSchema);


const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      color: { type: String, required: false },
      price: { type: Number, required: true },
    },
  ],
  cartTotal: { type: Number, required: true },
  orderBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
