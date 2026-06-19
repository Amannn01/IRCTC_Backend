class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

class badRequestError extends AppError {
    constructor(message, code = "BAD_REQUEST") {
        super(message, 400, code);
        console.log(this);
        console.log(this.message);
    }
}

class unauthorizedError extends AppError {
    constructor(message, code = "UNAUTHORIZED") {
        super(message, 401, code);
    }
}

class forbiddenError extends AppError {
    constructor(message, code = "FORBIDDEN") {
        super(message, 403, code);
    }
}

class notFoundError extends AppError {
    constructor(message, code = "NOT_FOUND") {
        super(message, 404, code);
    }
}

class conflictError extends AppError {
    constructor(message, code = "CONFLICT") {
        super(message, 409, code);
    }
}

class internalServerError extends AppError {
    constructor(message, code = "INTERNAL_SERVER_ERROR") {
        super(message, 500, code);
    }
}

class validationError extends AppError {
    constructor(message, code = "VALIDATION_ERROR") {
        super(message, 422, code);
    }
}
class TooManyRequestsError extends AppError {
    constructor(message, code = "TOO_MANY_REQUESTS") {
        super(message, 429, code);
    }
}

module.exports = {
    AppError,
    badRequestError,
    unauthorizedError,
    forbiddenError,
    notFoundError,
    conflictError,
    internalServerError,
    validationError,
    TooManyRequestsError
}

