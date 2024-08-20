const ProductCategory = require('../models/productCategoryModel')
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId')

// #region create category
const createCategory = asyncHandler(async (req, res) => {
    try{
        const newCategory = await ProductCategory.create(req.body)
        res.json(newCategory)
    } catch(error){
        throw new Error(error)
    }
})

// #region update category
const updateCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateCategory = await ProductCategory.findByIdAndUpdate(id, req.body, {new: true})
        res.json(updateCategory);
    } catch(error){
        throw new Error(error)
    }
})

// #region delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id)
    try{
        const deleteCategory = await ProductCategory.findByIdAndDelete(id)
        res.json(deleteCategory)
    } catch(error){
        throw new Error(error)
    }
    
})


// #region get Category
const getCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id)
    try{
      const getACategory = await ProductCategory.findById(id);
      res.json(getACategory)
    } catch(error){
        throw new Error(error)
    }
}) 

// #region get All Category
const getAllCategory = asyncHandler(async (req, res) => {
    try{
        const getAllCategory = await ProductCategory.find();
        res.json(getAllCategory)
    } catch(error){
        throw new Error(error)
    }
})


module.exports = {createCategory, updateCategory, deleteCategory, deleteCategory, getCategory, getAllCategory}