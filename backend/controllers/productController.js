const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

// create product -- only dmin do this work
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
        productCount,
    });
});

// Update Product -- only Admin route (keval isko admin he ker sakta h)
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    await product.remove();
    res.status(200).json({
        success: true,
        message: "Product Delete Successfully",
    });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

// Get All Reviews of a product ( is function ke help se hm kise bhi ek product ke sare reviews dekh sakte h )
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    // basically hm findById deke hm us product ko dhund legay

    // uske bad yadi product nahi milta h to hm de degay ek condition 
    if (!product) {
        return next(new ErrorHander("Product not found", 404)); // isme yaha message show ker dega yadi product nahi mila to 
    }

    // or reponse me yaha mil jayega hame
    res.status(200).json({
        success: true,
        reviews: product.reviews, // or review me yah dal degay
    });
});
// so hm ne yaha bana leye product ke sare review lene ka 
// or iske sath hm bana legay delete kerne ka 
// or hm getProductReviews function ka route set ker degay productRoute me

// Delete Review ( or hm deleteRReview function ke help se review delete ker sakte h )
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    // basically hm findById deke hm us product ko dhund legay

    // uske bad yadi product nahi milta h to hm de degay ek condition 
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    // is varaible se hm kea karegay ke, jo review hame chaheye usko hm rakh legay, or jo nahi chaheye vaha nahi rakhe gay
    // to iske liye hamre passs do method h ke :- 
    // 1. jo hame nahi chaheye usko delete ker de.
    // 2. or jo hame review chaheye vo rakhe
    // dekhte h hm iske liye kea kerte h  
    const reviews = product.reviews.filter( // filter method ke help se vo review rakhegay jo hame chaheye
        (rev) => rev._id.toString() !== req.query.id.toString() 
    ); 
    // jo review delete kerna h vo ( !== req.query.id.toString() ) esse ho jayegye, delete hone ke bad jo bache huve h 
    // mltb jo hame rakhne h usse hm review me save kerva degay

    // or delete hone ke bad jo review rahegay unka average rating ke liye yaha use keya h hm ne 
    let avg = 0; // isse review ka average rating nikal jayega

    // or isme jine review user dalta rahega vaha add hote rahegay
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0; //starting me review zero show karega

    // yadi reviews ke length 0 rahegye to ratings zero show ker dega
    if (reviews.length === 0) {
        ratings = 0;
    }
    // or yadi kuch review rahegay to hm, rating ko average me dekha degay 
    else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length; // or kitne review aaye h utne review yaha show ker dega number me

    // or yaha hm productId ko leke hm update ker degay 
    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    // or reponse me yaha mil jayega hame
    res.status(200).json({
        success: true,
    });
});
// or yaha hm ne delete review ka bhi bana leya h 
// or hm deleteReview function ka route set ker degay productRoute me

