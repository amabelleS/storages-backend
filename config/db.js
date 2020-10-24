const mongoose = require('mongoose');

// const config = require('config');
// const db = config.get('mongoURI');
// const db = process.env.mongoURL;
// const { DB_USER, DB_PASSWORD, DB_NAME } = config.get('DB_USER');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.htxhe.mongodb.net/storages?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err.message);

    //Exit process on failure
    process.exit(1);
  }
};

module.exports = connectDB;
