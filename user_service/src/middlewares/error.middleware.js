const { AppError } = require('../utils/error');
module.exports = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: false,
            message: err.message,
            error: err.error
        });
    }
    console.error("Unexpected error:", err);
    res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message,
        code: err.code
    });
}


