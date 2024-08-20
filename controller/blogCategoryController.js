const Category = require("../models/blogCategory");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// #region create blog category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

// #region update blog category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCategory);
  } catch (error) {
    throw new Error(error);
  }
});

// #region delete blog category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    res.json(deleteCategory);
  } catch (error) {
    throw new Error(error);
  }
});


// #region get Category
const getCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id)
    try{
      const getACategory = await Category.findById(id);
      res.json(getACategory)
    } catch(error){
        throw new Error(error)
    }
}) 

// #region get All Category
const getAllCategory = asyncHandler(async (req, res) => {
    try{
        const getAllCategory = await Category.find();
        res.json(getAllCategory)
    } catch(error){
        throw new Error(error)
    }
})

module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory };
