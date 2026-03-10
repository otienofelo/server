//centralised error handling 
const errorHandler = (err, req, res, next) => {
    console.log(err, err.stack);
    res.status(500).json({
        status:500,
        message:"Something went wrong",
        error: err.message
    })
}

export default errorHandler;