const RazorPay = require("razorpay");

const instance = new RazorPay({
  // key_id: process.env.RAZORPAY_API_KEY,
  // key_secret: process.env.RAZORPAY_API_SECRET,
});

const checkout = async (req, res) => {
  // const {amount} = req.body;
  // const options = {
  //   amount: amount,
  //   currency: "BDT",
  //   receipt: "receipt#1",
  // };
  // const order = await instance.orders.create(options);
  // res.status(200).json({
  //   success: true,
  //   order,
  // });
};

const paymentVerification = async (req, res) => {
  // const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =req.body;
  //   res.json({
  //       razorpayOrderId,
  //       razorpayPaymentId,
  //   })
};


module.exports = { checkout, paymentVerification };