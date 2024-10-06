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
  createOrder,
  removeProductFromCart,
  updateProductQuantityFormCart,
  getMyOrders,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const { checkout, paymentVerification } = require("../controller/paymentController");

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassowrd);
router.post("/login", loginUserController);
router.post("admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
// router.post("/order/checkout", authMiddleware, checkout);
// router.post("/order/paymentVerification", authMiddleware, paymentVerification);
// router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/all-users", getAllUsers);
router.get('/getmyorders', authMiddleware, getMyOrders);
// router.get("/get-orders", authMiddleware, getOrders);
// router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
// router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);

router.get("/:id", authMiddleware, isAdmin, getSingleUser);
router.delete("/delete-product-cart/:cardItemId", authMiddleware, removeProductFromCart);
router.delete("/update-product-cart/:cardItemId/:newQuantity", authMiddleware, updateProductQuantityFormCart);
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
