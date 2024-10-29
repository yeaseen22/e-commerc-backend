const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// #region Create User
const createUser = asyncHandler(async (req, res) => {
  const email = req?.body?.email;
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    /* #region Create New User */
    const newUser = await User.create(req.body);
    res.json(newUser);

  } else {
    /* #region User Already Exists */
    throw new Error("User already exists");
  }
});

// #region Login User
const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  // check if user exists or not
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);

    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      { refreshToken },
      { new: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });

  } else {
    throw new Error("Invalid credentials");
  }
});

//  #region Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (findAdmin && findAdmin.role !== "admin")
    throw new Error("Not Authorized");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin?._id,
      { refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstName: findAdmin?.firstName,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  }
});

// #region Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token in database or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }

    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
  res.json(user);
});

// #region logout functinalities
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    return res.sendStatus(204); //forbidden
  }


  // Check the Refresh token is there or not..
  if (!refreshToken) {
    throw new Error("Refresh token is not found!");
  }

  await User.findOneAndUpdate({ refreshToken }, {
    refreshToken: "",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    message: 'User Loggedout successfully!',
    user: {
      _id: user?._id,
      email: user?.email,
    },
  });
});

// #region Update A User
const updateAUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

// #Save User Address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// #region Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// #region Get A Single User
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  console.log(id);
  try {
    const getAUser = await User.findById(id);
    res.json(getAUser);
  } catch (error) {
    throw new Error(error);
  }
});

// region Delete A User
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (error) {
    throw new Error(error);
  }
});

// #region Block A User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

//#region Unblock A User
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unBlock = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// #region update password
const updatePassowrd = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  console.log("user id", _id);
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

// #region Forgot Password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi please follow this link to reset your password. This link valid till 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    // console.log('user token',token)
    console.log(data.to, "and", data.text);

    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

//#region Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

// region get Wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser.wishlist);
  } catch (error) {
    throw new Error(error);
  }
});

// #region userCart
// const userCart = asyncHandler(async (req, res) => {

//   console.log('req.user:', req.user);
//   console.log('req.body:', req.body);

//   const { productId, color, quantity, price } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);

//   // console.log('form user cart',req.body)

//   if (!quantity || !price) {
//     return res.status(400).json({
//       message: "Quantity and price are required fields."
//     });
//   }

//   try {
//     // Check and remove existing cart for the user
//     const existingCart = await Cart.findOne({ userId: _id });
//     if (existingCart) {
//       await existingCart.remove();
//     }

//     // Create the new cart
//     const newCart = await Cart.create({
//       userId: _id,
//       productId,
//       color,
//       quantity,
//       price,
//     });

//     res.status(201).json({
//       success: true,
//       data: newCart,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// const userCart = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { productId, color, quantity, price } = req.body.cart;
//   // console.log(productId, color, quantity, price);
//   console.log(req.body);

//   validateMongoDbId(_id);
//   try {
//     // let products = [];
//     // const user = await User.findById(_id);
//     // const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
//     // if (alreadyExistCart) {
//     //   alreadyExistCart.remove();
//     // }
//     // for (let i = 0; i < cart.length; i++) {
//     //   let object = {};
//     //   object.product = cart[i]._id;
//     //   object.count = cart[i].count;
//     //   object.color = cart[i].color;
//     //   let getPrice = await Product.findById(cart[i]._id).select("price").exec();
//     //   getPrice = getPrice.price;
//     //   products.push(object);
//     // }
//     // let cartTotal = 0;
//     // for (let i = 0; i < products.length; i++) {
//     //   cartTotal = cartTotal += products[i].price * products[i].count;
//     // }

//     let newCart = await new Cart({
//       userId: _id,
//       productId,
//       color,
//       price,
//       quantity,
//     }).save();
//     res.json(newCart);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const userCart = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  validateMongoDbId(userId); // Ensure user ID is valid

  const { cart } = req.body; // Incoming cart items

  try {
    // Remove existing cart for the user
    await Cart.deleteMany({ user: userId });

    // Initialize total for new cart
    let cartTotal = 0;

    // Validate and structure product list
    const productList = await Promise.all(
      cart.map(async (item) => {
        const { productId, color, quantity, price } = item;

        // Check if all required fields are present
        if (!price || !quantity || !productId) {
          throw new Error(
            "Product ID, price, and quantity are required for each item."
          );
        }

        // Calculate and accumulate total price
        cartTotal += price * quantity;

        return {
          product: productId,
          quantity,
          color,
          price,
        };
      })
    );

    // Create a new cart with the calculated values
    const newCart = await Cart.create({
      user: userId,
      products: productList,
      cartTotal,
      orderBy: userId,
    });

    // Return the newly created cart
    res.status(201).json({
      success: true,
      products: newCart.products,
      cartTotal: newCart.cartTotal,
      orderBy: newCart.orderBy,
      _id: newCart._id,
      createdAt: newCart.createdAt,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// region get user Cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .pupulate("productId")
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

// region empty user cart
// const emptyCart = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     const user = await User.findOne({ _id });
//     const cart = await Cart.findOneAndRemove({ orderBy: user._id });
//     res.json(cart);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// #region remove cart
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cardItemId } = req.params;
  validateMongoDbId(_id);

  try {
    const deleteProductFormCart = await Cart.deleteOne({
      userId: _id,
      _id: cardItemId,
    });
    res.json(deleteProductFormCart);
  } catch (error) {
    throw new Error(error);
  }
});

//#region update product cart quantity
const updateProductQuantityFormCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cardItemId, newQuantity } = req.params;
  validateMongoDbId(_id);

  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cardItemId,
    });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

// const createCashOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied } = req.body;
//   const userId = req.user._id; // Assuming req.user contains the authenticated user ID

//   try {
//     // Retrieve the user's cart
//     const cart = await Cart.findOne({ user: userId });
//     console.log("Cart Data:", cart);

//     // Check if the cart exists and contains products
//     if (!cart || !cart.products.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart is empty or not found" });
//     }

//     // Calculate the total price with optional coupon discount
//     let totalPrice = cart.cartTotal || cart.totalPrice;
//     if (couponApplied) {
//       totalPrice = totalPrice * 0.9; // Assuming a 10% discount for coupons
//     }

//     // Create a new order
//     const order = await Order.create({
//       user: userId,
//       products: cart.products.map((item) => ({
//         product: item.product,
//         quantity: item.quantity,
//         price: item.price,
//       })),
//       totalPrice,
//       paymentInfo: { method: COD ? "COD" : "Online" },
//       couponApplied: !!couponApplied,
//       status: "Pending",
//     });

//     // Clear the cart after order creation
//     await Cart.findOneAndUpdate(
//       { user: userId },
//       { products: [], totalPrice: 0, cartTotal: 0 }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const createCashOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied ,orderId,amount} = req.body;
//   const userId = req.user._id; // Assuming req.user contains the authenticated user ID

//   try {
//     // Retrieve the user's cart
//     const cart = await Cart.findOne({ user: userId });
//     console.log("Cart Data:", cart);

//     // Check if the cart exists and contains products
//     if (!cart || !cart.products.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart is empty or not found" });
//     }

//     // Calculate the total price with optional coupon discount
//     let totalPrice = cart.cartTotal || cart.totalPrice;
//     if (couponApplied) {
//       totalPrice = totalPrice * 0.9; // Assuming a 10% discount for coupons
//     }

//     // Create a new order with a pending status
//     const order = await Order.create({
//       user: userId,
//       products: cart.products.map((item) => ({
//         product: item.product,
//         quantity: item.quantity,
//         price: item.price,
//       })),
//       totalPrice,
//       paymentInfo: { method: COD ? "COD" : "Online" },
//       couponApplied: !!couponApplied,
//       status: "Pending",
//       _id:orderId,
//     });

//     // If payment method is bKash, initiate payment
//     if (!COD) {
//       const paymentResponse = await initiateBkashPayment({
//         body: {
//           amount: totalPrice,
//           orderId: order._id // Use the order ID for reference
//         },
//       });

//       if (!paymentResponse.success) {
//         return res.status(500).json({
//           success: false,
//           message: "Payment initiation failed",
//           error: paymentResponse.message,
//         });
//       }

//       // Optionally, you can update the order with payment information here
//       order.paymentInfo = {
//         method: "bKash",
//         paymentID: paymentResponse.paymentID // Save the payment ID for tracking
//       };
//       await order.save();
//     }

//     // Clear the cart after order creation
//     await Cart.findOneAndUpdate(
//       { user: userId },
//       { products: [], totalPrice: 0, cartTotal: 0 }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const createCashOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied, amount, orderId } = req.body;
//   const userId = req.user._id; // Assuming req.user contains the authenticated user ID

//   try {
//     // Here you would still want to calculate your order total based on the cart,
//     // but for the sake of this example, we will use the amount directly provided.

//     // Create a new order
//     const order = await Order.create({
//       user: userId,
//       products: [], // You can fill in with cart products if applicable
//       totalPrice: amount, // Use the amount provided in the request
//       paymentInfo: { method: COD ? "COD" : "Online" },
//       couponApplied: !!couponApplied,
//       status: "Pending",
//       _id: orderId, // Use the provided orderId
//     });

//     // If payment method is bKash and not COD, initiate payment
//     if (!COD) {
//       const paymentResponse = await initiateBkashPayment({
//         body: {
//           amount,
//           orderId: order._id, // Use the order ID for reference
//         },
//       });

//       if (!paymentResponse.success) {
//         return res.status(500).json({
//           success: false,
//           message: "Payment initiation failed",
//           error: paymentResponse.message,
//         });
//       }

//       // Update the order with payment information
//       order.paymentInfo = {
//         method: "bKash",
//         paymentID: paymentResponse.paymentID, // Save the payment ID for tracking
//       };
//       await order.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const createCashOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied, shippingInfo } = req.body; // Include shippingInfo from request body
//   const userId = req.user._id; // Assuming req.user contains the authenticated user ID

//   try {
//     // Retrieve the user's cart
//     const cart = await Cart.findOne({ user: userId });
//     console.log("Cart Data:", cart);

//     // Check if the cart exists and contains products
//     if (!cart || !cart.products.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart is empty or not found" });
//     }

//     // Calculate the total price with optional coupon discount
//     let totalPrice = cart.cartTotal || cart.totalPrice;
//     if (couponApplied) {
//       totalPrice *= 0.9; // Assuming a 10% discount for coupons
//     }

//     // Create a new order with the required shipping info
//     const order = await Order.create({
//       user: userId,
//       products: cart.products.map((item) => ({
//         product: item.product,
//         quantity: item.quantity,
//         price: item.price,
//       })),
//       totalPrice, // Make sure totalPrice is correctly calculated
//       paymentInfo: { method: COD ? "COD" : "Online" }, // Ensure paymentInfo is structured correctly
//       shippingInfo: {
//         firstName: shippingInfo.firstName, // Include these fields from the request body
//         lastName: shippingInfo.lastName,
//         address: shippingInfo.address,
//         city: shippingInfo.city,
//         state: shippingInfo.state,
//         pincode: shippingInfo.pincode,
//         other: shippingInfo.other, // Any additional information
//       },
//       couponApplied: !!couponApplied,
//       status: "Pending",
//     });

//     // Clear the cart after order creation
//     await Cart.findOneAndUpdate(
//       { user: userId },
//       { products: [], totalPrice: 0, cartTotal: 0 }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const createCashOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied, shippingInfo } = req.body; // Include shippingInfo from request body
//   const userId = req.user._id; // Assuming req.user contains the authenticated user ID

//   try {
//       // Retrieve the user's cart
//       const cart = await Cart.findOne({ user: userId });

//       // Check if the cart exists and contains products
//       if (!cart || !cart.products.length) {
//           return res.status(404).json({ success: false, message: "Cart is empty or not found" });
//       }

//       // Calculate the total price with optional coupon discount
//       let totalPrice = cart.cartTotal || cart.totalPrice;
//       if (couponApplied) {
//           totalPrice *= 0.9; // Assuming a 10% discount for coupons
//       }

//       // Create a new order with the required shipping info
//       const order = await Order.create({
//           user: userId,
//           products: cart.products.map((item) => ({
//               product: item.product,
//               quantity: item.quantity,
//               price: item.price,
//           })),
//           totalPrice, // Make sure totalPrice is correctly calculated
//           paymentInfo: { method: COD ? "COD" : "Online" }, // Ensure paymentInfo is structured correctly
//           shippingInfo: {
//               firstName: shippingInfo.firstName,
//               lastName: shippingInfo.lastName,
//               address: shippingInfo.address,
//               city: shippingInfo.city,
//               state: shippingInfo.state,
//               pincode: shippingInfo.pincode,
//               other: shippingInfo.other,
//           },
//           couponApplied: !!couponApplied,
//           status: "Pending",
//       });

//       // Clear the cart after order creation
//       await Cart.findOneAndUpdate(
//           { user: userId },
//           { products: [], totalPrice: 0, cartTotal: 0 }
//       );

//       res.status(201).json({
//           success: true,
//           message: "Order created successfully",
//           order,
//       });
//   } catch (error) {
//       console.error("Error creating order:", error);
//       res.status(500).json({ success: false, message: error.message });
//   }
// });


const createCashOrder = async (req, res) => {
  try {
    const { user, orderItems, totalPrice, shippingInfo } = req.body;

    // Create a new order in the database
    const newOrder = await Order.create({
      user,
      orderItems,
      shippingInfo,
      paymentInfo: { method: "Cash on Delivery" },
      totalPrice,
      orderStatus: "Pending",
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};




// const createStripePayment = async (req, res) => {
//     try {
//         const { user, orderItems, totalPrice, shippingInfo } = req.body;

//         // Create a new payment intent with Stripe
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: totalPrice * 100, // Stripe uses cents
//             currency: "usd", // or "bdt" based on your setup
//             payment_method_types: ["card"]

//         });

//         // Create a new order in the database
//         const newOrder = await Order.create({
//             user,
//             orderItems,
//             shippingInfo,
//             paymentInfo: { method: "Stripe", transactionId: paymentIntent.id },
//             totalPrice,
//             orderStatus: "Processing",
//         });

//         res.status(201).json({
//             success: true,
//             order: newOrder,
//             clientSecret: paymentIntent.client_secret,
//         });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

const createStripePayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"]
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message
    });
  }
};


// #region getMyOrders
// const getMyOrders = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   console.log("Order ID:", _id); // Debugging the ID input

//   try {
//     const orders = await Order.find({ user: _id })
//       .populate("user")
//       .populate("orderItems.product")
//       .populate("orderItems.color");
//     res.json({ orders });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const getMyOrders = asyncHandler(async (req, res) => {
//   const { orderId } = req.params;
//   console.log("Order ID:", orderId); // Debugging the ID input

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is missing in request" });
//   }

//   try {
//     validateMongoDbId(orderId);
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid Order ID format" });
//   }

//   try {
//     const order = await Order.findById(orderId).populate("user products.product");
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     res.json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const getMyOrders = asyncHandler(async (req, res) => {
//   const userId = req.params; // Assume user is authenticated and user ID is available
//   console.log('user id',userId);


//   // Optional: Validate user ID if necessary
//   if (!userId) {
//     return res.status(400).json({ success: false, message: "Invalid user ID." });
//   }

//   try {
//     // Fetch orders with populated products
//     const orders = await Order.find({ user: userId }).populate("products.product");

//     // Check if orders were found
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ success: false, message: "No orders found." });
//     }

//     // Return the orders with a success status
//     res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     // Log the error for debugging
//     console.error("Error fetching orders:", error);

//     // Send a 500 error response
//     res.status(500).json({ success: false, message: "Internal server error." });
//   }
// });

const getMyOrders = asyncHandler(async (req, res) => {
  // Extract user ID from params
  const { id: userId } = req.params; // Destructure to get the userId directly
  console.log('user id', userId);

  // Validate user ID
  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    // Fetch orders associated with the user ID
    const orders = await Order.find({ user: userId }).populate("orderItems.product");

    // Check if orders were found
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found." });
    }

    // Return the orders with a success status
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching orders:", error);

    // Send a 500 error response
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});



// const getMyOrders = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   console.log("User ID:", userId);
//   try {
//     // Retrieve the user's orders, populating product details
//     const orders = await Order.find({ user: userId })
//       .populate("products.product")
//       .populate("orderby") // Populate product details
//       .exec(); // Execute the query

//     console.log("Fetched Orders:", orders);

//     // Check if any orders were found
//     if (!orders || orders.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No orders found." });
//     }

//     // Send the orders in the response
//     res.status(200).json({
//       success: true,
//       orders, // Send the list of orders
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error); // Log any errors
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const getAllOrders = asyncHandler(async (req, res) => {
//   try {
//     // Retrieve the user's orders, populating product details
//     const allUserOrders = await Order.find()
//       .populate("orderItems.product")
//       .populate("orderItems.color")
//       .populate("orderItems.orderby") // Populate user details for each product
//       .exec();

//     // Check if any orders were found
//     if (!allUserOrders || allUserOrders.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No orders found." });
//     }

//     // Send the orders in the response
//     res.status(200).json(allUserOrders);
//   } catch (error) {
//     console.error("Error fetching orders:", error); // Log any errors
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// const getAllOrders = asyncHandler(async (req, res) => {
//   try {
//     // Retrieve all orders, populating nested fields in orderItems
//     const allUserOrders = await Order.find()
//       .populate({
//         path: "orderItems",
//         populate: [
//           { path: "orderby", select: "email firstName lastName" }, // Populate orderby field
//           { path: "product", select: "title price" }, // Populate product field
//           { path: "color", select: "title" }, // Populate color field
//         ],
//       })
//       // .populate("user", "firstName lastName email") // Populate the main user field
//       // .lean();
//     // Check if any orders were found
//     if (!allUserOrders || allUserOrders.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No orders found." });
//     }

//     // Send the orders in the response
//     res.status(200).json({ success: true, orders: allUserOrders });
//   } catch (error) {
//     console.error("Error fetching orders:", error.message); // Log any errors
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to retrieve orders." });
//   }
// });


const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // Retrieve all orders, populating nested fields in products and user
    const allUserOrders = await Order.find()
      .populate({
        path: "orderItems", // Populate the products field instead of orderItems
        populate: [
          { path: "product", select: "title price" }, // Populate product field
          { path: "color", select: "title" }, // Populate color field
        ],
      })
      .populate({ path: "user", select: "firstName lastName email" }) // Populate the user field
      .lean(); // Convert to plain JavaScript object
    const allUser = await User.find()

    // Check if any orders were found
    if (!allUserOrders || allUserOrders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found." });
    }

    // Send the orders in the response, including user information
    res.status(200).json({ success: true, orders: allUserOrders });
  } catch (error) {
    console.error("Error fetching orders:", error.message); // Log any errors
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve orders." });
  }
});


// region apply coupon
// const applyCoupon = asyncHandler(async (req, res) => {
//   const { coupon } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   const validCoupon = await Coupon.findOne({ name: coupon });
//   if (validCoupon === null) {
//     throw new Error("Invalid Coupon");
//   }
//   const user = await User.findOne({ _id });
//   let { cartTotal } = await Cart.findOne({
//     orderby: user._id,
//   }).populate("products.product");
//   let totalAfterDiscount = (
//     cartTotal -
//     (cartTotal * validCoupon.discount) / 100
//   ).toFixed(2);
//   await Cart.findOneAndUpdate(
//     { orderby: user._id },
//     { totalAfterDiscount },
//     { new: true }
//   );
//   res.json(totalAfterDiscount);
// });

// region create order
// const createOrder = asyncHandler(async (req, res) => {
//   const { COD, couponApplied } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     if (!COD) throw new Error("Create cash order failed");
//     const user = await User.findById(_id);
//     let userCart = await Cart.findOne({ orderby: user._id });
//     let finalAmout = 0;
//     if (couponApplied && userCart.totalAfterDiscount) {
//       finalAmout = userCart.totalAfterDiscount;
//     } else {
//       finalAmout = userCart.cartTotal;
//     }

//     let newOrder = await new Order({
//       products: userCart.products,
//       paymentIntent: {
//         id: uniqid(),
//         method: "COD",
//         amount: finalAmout,
//         status: "Cash on Delivery",
//         created: Date.now(),
//         currency: "usd",
//       },
//       orderby: user._id,
//       orderStatus: "Cash on Delivery",
//     }).save();
//     let update = userCart.products.map((item) => {
//       return {
//         updateOne: {
//           filter: { _id: item.product._id },
//           update: { $inc: { quantity: -item.count, sold: +item.count } },
//         },
//       };
//     });
//     const updated = await Product.bulkWrite(update, {});
//     res.json({ message: "success" });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// region get user orders
// const getOrders = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     const userorders = await Order.findOne({ orderby: _id })
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     res.json(userorders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

//
// const getAllOrders = asyncHandler(async (req, res) => {
//   try {
//     const alluserorders = await Order.find()
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     res.json(alluserorders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// region get order by id
// const getOrderByUserId = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const userorders = await Order.findOne({ orderby: id })
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     res.json(userorders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// region update order status
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       {
//         orderStatus: status,
//         paymentIntent: {
//           status: status,
//         },
//       },
//       { new: true }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
//   let monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
//   let d = new Date();
//   let endDate = '';
//   d.setDate(1);
//   for(let i=0; i < 11; i++){
//     d.setMonth(d.getMonth() - i);
//     endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
//   }
//   const data = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $lte: new Date(),
//           $gte: new Date(endDate),
//         },
//       },
//       $group: {
//         _id: {
//           month: "$month"
//         },
//         amount: {
//           $sum: "$totalAfterDiscount"
//         }
//       }
//     }
//   ])
//   res.json(data);
// })

// const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
//   let d = new Date();

//   // Get the start date for the last 12 months (including the current month)
//   let startDate = new Date(d.getFullYear(), d.getMonth() - 11, 1); // 11 months ago from the current month

//   const data = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $gte: startDate, // Only consider orders from the last 12 months
//           $lte: new Date(), // Up to the current date
//         },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: { $month: "$createdAt" }, // Group by month
//           year: { $year: "$createdAt" },   // Group by year
//         },
//         totalIncome: {
//           $sum: "$totalIncome", // Sum of total income
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the default _id field
//         month: "$_id.month",
//         year: "$_id.year",
//         totalIncome: "$totalIncome", // Rename for clarity
//       },
//     },
//     {
//       $sort: {
//         year: 1, // Sort by year
//         month: 1 // Sort by month
//       }
//     }
//   ]);

//   // Prepare an array for all months of the current year
//   const months = Array.from({ length: 12 }, (_, index) => {
//     return { month: index + 1, year: d.getFullYear(), totalIncome: 0 }; // Initialize with zero income
//   });

//   // Populate the months array with data from the aggregation
//   data.forEach(entry => {
//     const monthIndex = entry.month - 1; // Adjust for zero-based index
//     const yearIndex = months.findIndex(m => m.month === entry.month && m.year === entry.year);
//     if (yearIndex !== -1) {
//       months[yearIndex].totalIncome = entry.totalIncome; // Update the totalIncome
//     }
//   });

//   res.json(months);
// });


const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let d = new Date();

  // Get the start date for the last 12 months (including the current month)
  let startDate = new Date(d.getFullYear(), d.getMonth() - 11, 1); // 11 months ago from the current month

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate, // Only consider orders from the last 12 months
          $lte: new Date(), // Up to the current date
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" }, // Group by month
          year: { $year: "$createdAt" },   // Group by year
        },
        totalIncome: { $sum: "$totalPrice" }, // Sum of total price as income
        orderCount: { $sum: 1 }, // Count the number of orders in each month
      },
    },
    {
      $match: {
        orderCount: { $gt: 0 }, // Filter out months with zero orders
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        month: "$_id.month",
        year: "$_id.year",
        totalIncome: "$totalIncome",
        orderCount: "$orderCount",
      },
    },
    {
      $sort: {
        year: 1, // Sort by year
        month: 1, // Sort by month
      },
    },
  ]);

  res.json(data);
});


const getMonthWiseOrderCount = asyncHandler(async (req, res) => {
  let d = new Date();

  // Get the start date for the last 12 months (including the current month)
  let startDate = new Date(d.getFullYear(), d.getMonth() - 11, 1); // 11 months ago from the current month

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate, // Only consider orders from the last 12 months
          $lte: new Date(), // Up to the current date
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" }, // Group by month
          year: { $year: "$createdAt" },   // Group by year
        },
        orderCount: {
          $sum: 1, // Count the number of orders
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        month: "$_id.month",
        year: "$_id.year",
        orderCount: "$orderCount", // Rename for clarity
      },
    },
    {
      $sort: {
        year: 1, // Sort by year
        month: 1 // Sort by month
      }
    }
  ]);

  // Prepare an array for all months of the current year
  const months = Array.from({ length: 12 }, (_, index) => {
    return { month: index + 1, year: d.getFullYear(), orderCount: 0 }; // Initialize with zero count
  });

  // Populate the months array with data from the aggregation
  data.forEach(entry => {
    const monthIndex = entry.month - 1; // Adjust for zero-based index
    const yearIndex = months.findIndex(m => m.month === entry.month && m.year === entry.year);
    if (yearIndex !== -1) {
      months[yearIndex].orderCount = entry.orderCount; // Update the orderCount
    }
  });

  res.json(months);
});


const getCurrentYearTotalOrderIncome = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();

  const data = await Order.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, currentYear], // Match orders for the current year
        },
      },
    },
    {
      $group: {
        _id: null, // No specific grouping
        totalOrders: { $sum: 1 }, // Count the total number of orders
        totalAmountAfterDiscount: {
          $sum: {
            $cond: {
              if: { $gt: ["$discountRate", 0] }, // Apply only if there's a discount
              then: { $multiply: ["$totalPrice", { $subtract: [1, "$discountRate"] }] },
              else: "$totalPrice", // No discount, use totalPrice directly
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        totalOrders: 1,
        totalAmountAfterDiscount: 1, // Ensure calculated amount is included
      },
    },
  ]);

  // Handle cases where there are no orders for the current year
  const result = data.length > 0 ? data[0] : { totalOrders: 0, totalAmountAfterDiscount: 0 };

  res.json(result);
});






module.exports = {
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
  saveAddress,
  getWishlist,
  userCart,
  getUserCart,
  // createOrder,
  // emptyCart,
  // applyCoupon,
  // createOrder,
  // getOrders,
  // updateOrderStatus,
  // getAllOrders,
  // getOrderByUserId,
  removeProductFromCart,
  updateProductQuantityFormCart,
  getMyOrders,
  createCashOrder,
  getAllOrders,
  createStripePayment,
  getMonthWiseOrderIncome,
  getMonthWiseOrderCount,
  getCurrentYearTotalOrderIncome
};
