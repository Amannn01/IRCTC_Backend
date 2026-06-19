const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');                                    //multiple service security 
const {config} = require('./src/config');
const logger = require('./src/config/logger');

const {corsMiddleware} = require('./src/middlewares/cors.middleware');
const errorHandler = require('./src/middlewares/error.middleware');
const {reqLogger} = require('./src/middlewares/req.middleware');
const authRouter = require('./src/routes/auth.route');
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(reqLogger);


app.get('/', (req, res) => {
  res.send('Hello from index.js of user_service!');
});

app.use('/api/auth', authRouter); 

app.use(errorHandler);
const startServer = async () => {
    try{
        const server = app.listen(config.PORT,()=>{
            logger.info(`${config.SERVICE_NAME} is running on port http://localhost:${config.PORT}`);
        })
    }catch (error) {
        logger.error("failed to start server", error);
        process.exit(1);
    }
}


startServer();