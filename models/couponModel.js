const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    name: { type: String, required: true },
    discount: { type: Number, required: true },
    expiry: { type: Date, required: true }, // This should be required
});
module.exports = mongoose.model("Coupon", couponSchema)
