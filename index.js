const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 40010;
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoutes');
const categoryRouter = require('./routes/productCategoryRoute');
const blogCategoryRouter = require('./routes/blogCategoryRoutes')
const brandRouter = require('./routes/brandRoutes')
const colorRouter = require("./routes/colorRoutes");
const couponRouter = require('./routes/couponRoutes')
const enqRouter = require('./routes/enqRoutes')
const uploadRouter = require("./routes/uploadRoutes");
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');


app.use(morgan('dev'))
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())

app.use('/api/user', authRouter)
app.use('/api/product', productRouter)
app.use('/api/blog', blogRouter)
app.use('/api/category', categoryRouter)
app.use('/api/blogcategory', blogCategoryRouter)
app.use('/api/brand', brandRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/color', colorRouter)
app.use('/api/enquiry', enqRouter)
app.use("/api/upload", uploadRouter);


app.use(notFound);
app.use(errorHandler);

dbConnect().then((() => {
    console.log('Database connected successfully');
    app.listen(PORT,() => {
        console.log(`Server is running on port ${PORT}`);
    })
})).catch((error) => {
    console.log('Database connection failed');;
    
})