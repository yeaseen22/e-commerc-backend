# Grocery E-Commerce Backend

## Overview

This project is the backend for a grocery e-commerce application built using Node.js, Express, and MongoDB. It provides RESTful API endpoints for managing products, users, orders, and other features required for a full-fledged e-commerce platform.

## Features

- User Authentication and Authorization (JWT)
- Role-based Access Control (Admin and Customer)
- Product Management (CRUD operations)
- Order Management (Create, Update, Fetch Orders)
- Cart and Wishlist Management
- Category and Brand Management
- File Uploads (Images for products)
- Advanced Filtering, Sorting, Pagination
- Secure Payments and Order Processing
- Error Handling and Logging
- Unit and Integration Testing

## Technologies Used

- **Node.js** - JavaScript runtime for building the backend
- **Express.js** - Web framework for Node.js
- **MongoDB** - NoSQL database for storing data
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Multer** - Middleware for handling `multipart/form-data` for file uploads
- **Cloudinary** - Image and video management platform

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v14.x or higher)
- **MongoDB** (v4.x or higher)
- **npm** (v6.x or higher)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/grocery-ecommerce-backend.git
   cd grocery-ecommerce-backend
   npm install

    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```




