import { createLogger, transports, format } from 'winston';


const logger = createLogger({
    transports: [
      new transports.Console(), // You can add more transports as needed
      new transports.File({ filename: 'error.log', level: 'error' }),
    ],
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
});

  const errorHandler = (err , req,res,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode ; 

    logger.error({
        statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
    
    //A sanitized response to all the errors to hide the sensitive details of the system
    res.status(statusCode).json({
        error: {
            message: 'Internal Server Error',
        },
    });

}

const notFound = (req,res,next)=>{
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };


export { 
    notFound , 
    errorHandler
}