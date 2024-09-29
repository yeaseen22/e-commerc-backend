const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs")

// #region create a product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// #region update a product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  //   console.log(id);
  console.log(req.body, "before");

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    console.log(req.body, "after");

    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// #region delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const {id} = req.params;
  validateMongoId(id)
  try {
    const deleteProduct = await Product.findOneAndDelete({ _id: id });
    console.log('from delete controller',deleteProduct);
    
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// #region get a product
const getAProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id).populate("color");
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// #region get all product
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }

    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

// #region add to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyRated = user.wishlist.find(
      (id) => id.toString() === prodId.toString()
    );
    if (alreadyRated) {
      let user = await user.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await user.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

// #region rating the product
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _.id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: {
            $elemMatch: alreadyRated,
          },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
    } else {
      const ratingProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: _id,
            },
          },
        },
        { new: true }
      );
    }

    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

// const uploadImages = asyncHandler(async (req, res) => {
//   try{
//     const uploader = (path) => cloudinaryUploadImg(path, "images");
//     const urls = [];
//     const files = req.files;
//     for(const file of files){
//       const {path} = file;
//       const newpath = await uploader(path)
//       urls.push(newpath);
//       fs.unlinkSync(path)
//     }
//     const images = urls.map(file => {
//       return file
//     })
//     res.json(images);
//   } catch(error){
//     throw new Error(error)
//   }
// })

module.exports = {
  createProduct,
  getAProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
};
