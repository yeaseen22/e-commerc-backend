const express = require('express');
const { createCategory, updateCategory, getCategory, getAllCategory } = require('../controller/blogCategoryController');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
const router = express.Router();


router.post('/', authMiddleware, isAdmin, createCategory)
router.put('/:id', authMiddleware, isAdmin, updateCategory)
router.delete('/:id', authMiddleware, isAdmin, );
router.get('/:id', getCategory)
router.get('/', getAllCategory)

module.exports = router;