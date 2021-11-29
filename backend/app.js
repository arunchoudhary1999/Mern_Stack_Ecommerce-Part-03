const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");

app.use(express.json());
app.use(cookieParser());

// Route ko import ker legay
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRouter"); 
// yaha per hm ne orderRouter ko import ker deya hai 

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
// or yaha per order ko use ker legay

// Middleware for Error
app.use(errorMiddleware);

module.exports = app;
