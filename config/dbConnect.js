const {default: mongoose} = require('mongoose')

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL);
        return conn;
        
    } catch(error){
        console.log(error);
        
    }
}

module.exports = dbConnect
