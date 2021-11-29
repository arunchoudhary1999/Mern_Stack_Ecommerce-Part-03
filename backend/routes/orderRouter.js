const express = require("express");
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
// isko keval admin he ker sakta hai is liye hmne yaha deya hai -> authorizeRoles("admin")
// or yaha per hmne getAllOrders function ka route set ker deya hai, get method ka use ker ke, 
// or isko import bhi ker leya hai

router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
// isme bhi keval admin he ker sakta hai is liye hmne yaha deya hai -> authorizeRoles("admin") dono me, or dono he
// same route me rahegay keoke product id se he kise order ko update or delete keya ja sakta hai, is liye hmne dono
// ko same route me leya hai
// dono function ( updateOrder, deleteOrder ko ka route set ker hm ne import ker leya hai )

module.exports = router;
