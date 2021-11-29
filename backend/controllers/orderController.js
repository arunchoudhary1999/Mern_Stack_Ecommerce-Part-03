const Order = require("../models/orderModel"); 
const Product = require("../models/productModel"); 
const ErrorHander = require("../utils/errorhander"); 
const catchAsyncErrors = require("../middleware/catchAsyncErrors"); 

// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body; 

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(), 
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order, 
    });
});

// get Single Order 
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate( 
      "user",
      "name email"
    );
  
    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404)); // or yaha message show ker dega hame
    }
  
    res.status(200).json({
      success: true,
      order,
    });
  });

// get logged in user Orders 
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }); 
  
    res.status(200).json({
      success: true,
      orders,
    });
  });

// get all Orders -- Admin ( sare order dekhne hai admin ko, yaha keval admin ke liye hai )
// iske liye hm ne getAllOrders nam ka ek function ko create keya hai jisse admin order keye gaye sare orders 
// dekh sakta hai
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find(); // keval hame find() method lagana hai isse hame sare order mil jayegay
  // hame order dekhane ke aalava bhi or kuch kam kerna hai

  // yaha hm sabhi order ka amount total kerva ke show kerva degay deshbord me
  let totalAmount = 0;
  // yaha per kitne bhi orders rahe gay unka total amount ko add ker ke dekha dega admin ko deshbard per
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  // or sabhi kam successfully hone per hame response me 200 status code show ker dega
  res.status(200).json({
    success: true,
    totalAmount, // total amount dekha degay
    orders, // or order dekha degay kitne hai
  });
});
// is tarah se hm nn fetAllOrders function ko complete ker leya hai
// or esse ke sath hm do function or create ker lete hai

// update Order Status -- Admin 
// ( isse admin duara order ko update keya jayega to iske liye hm ne updateOrder nam ke function ko create keya hai)
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id); 
  // jis order ko update kervana hai us product ke id degay hm find ker legay

  // aager order nahi mela to is condition ko run kerva degay
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404)); // or ye message show kerva degay
  }

  // jo order delivered ho gaya hai, to usme yaha condition run karegye
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400)); // or yaha message show ho jayega
  }

  // aager order delivered nahi huva hai to, ye wale condition run karegye
  // isse hame stock ka pata chalta rahega ke kitne delivered huve hai kitne nahi huve hi
  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  // or yaha se hame delivered ka time bhi hame show kervana hai vo bhi kerva leya hai
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  // yaha se hm save kerva legay
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

// yaha hm updateStock nam ka function ka bana legay, isme hm ne product ke id or quantity mil rahe hai
async function updateStock(id, quantity) {
  const product = await Product.findById(id); // isme hm product ke id dal ke find kerva degay
  //  to isse hame product mil jayega

  product.Stock -= quantity; // isme hm stock ke under product ko decrase kerva degay

  await product.save({ validateBeforeSave: false }); // or yaha per hm save kerva degay hm
}

// esse ke sat hm delete ke liye bhi bana lete hi hm, aager admin kise order ko delete kerna chahata 
// hai to ker sakta hai, iske liye hm deleteOrder nam ka ek function create ker lete hai hm
// delete Order -- Admin 
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  // isse hm product ke id deke hm product ko find ker legay

  // aager product nahi mela to ye wale condition show ker dega
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404)); // jisme yaha message dekha dega 
  }

  // or product mil jane per hm product ko remove ker sakte hai
  await order.remove(); // or hm order ko hatane ke liye hm remove() method ka use karegay

  // or successfully product delete ho jane per hame status code 200 show ker dega
  res.status(200).json({
    success: true,
  });
});
// or is tareke se hm ne deleteOrder function ko bhi bana leya hai
// or last me hm teeno (getAllOrder, updateOrder, deleteOrder) function ko banane ke bad hm teeno ko export 
// ker ek orderRouter file ke under hm inka route set ker degay jisse hm in teeno chijo ko aasane se ker sakte hai
