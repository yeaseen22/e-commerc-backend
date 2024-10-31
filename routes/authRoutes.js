const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUserController,
  getAllUsers,
  getSingleUser,
  deleteAUser,
  updateAUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassowrd,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  removeProductFromCart,
  updateProductQuantityFormCart,
  getMyOrders,
  createCashOrder,
  getAllOrders,
  createStripePayment,
  getMonthWiseOrderIncome,
  getMonthWiseOrderCount,
  getCurrentYearTotalOrderIncome,
  updateOrder,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");


router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassowrd);
router.post("/login", loginUserController);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
// router.post("/order/checkout", authMiddleware, checkout);
// router.post("/order/paymentVerification", authMiddleware, paymentVerification);
// router.post("/cart/applycoupon", authMiddleware, applyCoupon);
// router.post("/cart/create-order", authMiddleware, createOrder);
router.post("/cart/create-order", authMiddleware, createCashOrder);

router.get("/all-users", getAllUsers);
router.get("/get-allorders", authMiddleware, isAdmin, getAllOrders);
router.post("/getorderbyuser/:id", authMiddleware, getMyOrders);
router.put("/updateOrder/:id", authMiddleware, isAdmin, updateOrder);
router.post("/cash-order", createCashOrder); // For cash payments
router.post("/stripe-order", createStripePayment);

// router.get("/get-orders", authMiddleware, getOrders);
// router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
// router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);
router.get("/refresh", handleRefreshToken);
router.get("/logout", authMiddleware, logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
router.get("/getMonthWiseOrderIncome", authMiddleware, getMonthWiseOrderIncome);
router.get("/getMonthWiseOrderCount", authMiddleware, getMonthWiseOrderCount);
router.get("/getCurrentYearTotalOrder", authMiddleware, getCurrentYearTotalOrderIncome);



router.get("/:id", authMiddleware, isAdmin, getSingleUser);
router.delete(
  "/delete-product-cart/:cardItemId",
  authMiddleware,
  removeProductFromCart
);
router.delete(
  "/update-product-cart/:cardItemId/:newQuantity",
  authMiddleware,
  updateProductQuantityFormCart
);
// router.delete("/empty-cart", authMiddleware, emptyCart);

router.delete("/:id", deleteAUser);

// router.put(
//   "/order/update-order/:id",
//   authMiddleware,
//   isAdmin,
//   updateOrderStatus
// );

router.put("/edit-user", authMiddleware, updateAUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

module.exports = router;
