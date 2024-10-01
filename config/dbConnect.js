const {default: mongoose} = require('mongoose')

// const dbConnect = () => {
//     try{
//         const conn = mongoose.connect(process.env.MONGODB_URL);
//         return conn;
        
//     } catch(error){
//         console.log(error);
        
//     }
// }

// module.exports = dbConnect



const dbConnect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  };
  
  module.exports = dbConnect;