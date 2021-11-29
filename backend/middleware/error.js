const ErrorHander = require("../utils/errorhander");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongodb Id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHander(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${object.keys(err.keyword)} Entered`;
        err = new ErrorHander(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is Invalid, Try Again`;
        err = new ErrorHander(message, 400);
    }

    // JWT EXPIRE Error
    if (err.name === "TokenExpireError") {
        const message = `Json Web Token is Expire, Try Again`;
        err = new ErrorHander(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
