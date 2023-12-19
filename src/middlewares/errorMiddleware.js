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
    const statusCode = err.statusCode || 500; // Default to 500 for internal server errors
    const errorMessage = err.message || 'Internal Server Error';
    logger.error({
        statusCode,
        message: errorMessage,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
    
    //A sanitized response to all the errors to hide the sensitive details of the system
    res.status(statusCode).json({
        error: {
            message: errorMessage,
        },

    });

}

const notFound = (req,res,next)=>{
  if (req.originalUrl === '/favicon.ico') {
    // If the request is for favicon, just ignore it and return a 404 status
    res.status(404).end();
} else {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}
  };


export { 
    notFound , 
    errorHandler
}