import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/agrilink`)
            .then(()=>{
                console.log('database is connected at http://localhost:27018')
            })
    } catch (error) {
        console.log('database connection failed')
    }
}

export default connectDB