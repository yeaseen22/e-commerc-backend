
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      other: { type: String, required: true },
      pincode: { type: Number, required: true },
    },
    paymentInfo: {
      method: { type: String, required: true }, // Ensure it is a string, not ObjectId
      transactionId: { type: String },
    },
    orderItems: [
      {
        orderby: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User", 
          required: true 
        },
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        color: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Color", 
          required: true 
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        
      },
    ],
    paidAt: { 
      type: Date, 
      default: Date.now() 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    totalPriceAfterDiscount: { 
      type: Number 
    },
    orderStatus: {
      type: String,
      default: "Ordered",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     shippingInfo: {
//       firstName: {
//         type: String,
//         required: true,
//       },
//       lastName: {
//         type: String,
//         required: true,
//       },
//       address: {
//         type: String,
//         required: true,
//       },
//       city: {
//         type: String,
//         required: true,
//       },
//       state: {
//         type: String,
//         required: true,
//       },
//       other: {
//         type: String,
//         required: true,
//       },
//       pincode: {
//         type: Number,
//         required: true,
//       },
//     },
//     paymentInfo: {
//       razorpayOrderId: {
//         type: String,
//         required: true,
//       },
//       razorpayPaymentId: {
//         type: String,
//         required: true,
//       },
//     },
//     orderItems: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         color: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Color",
//           required: true,
//         },
//         qunatity: {
//           type: Number,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     paidAt:{
//       type:Date,
//       default:Date.now()
//     },
//     totalPrice: {
//       type: Number,
//       required: true,
//     },
//     totalPriceAfterDiscount: {
//       type: Number,
//       required: true,
//     },
//     orderStatus: {
//       type: String,
//       default: "Ordered",
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Order", orderSchema);


// models/orderModel.js
// const mongoose = require('mongoose');

// const orderSchema = mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   products: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true,
//       },
//       quantity: { type: Number, required: true },
//       price: { type: Number, required: true },
//     },
//   ],
//   totalPrice: { type: Number, required: true },
//   paymentInfo: {
//     method: { type: String, enum: ['COD', 'Online'], required: false },
//   },
//   couponApplied: { type: Boolean, default: false },
//   status: { type: String, default: 'Pending' },
// }, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
