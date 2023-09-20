import express from 'express'
import { forgotController, getAllOrdersController, getOrdersController, loginController, orderStatusController, registerController, testController, updateProfileController } from '../controllers/authController.js'
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router()

//routing
//Register || Method Post
router.post('/register', registerController)

//Login || POST
router.post('/login', loginController)

//Forgot Password
router.post('/forgot-password', forgotController)

//test Routes
router.get('/test', requireSignIn, isAdmin, testController)

//protected user route path
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ ok: true })
})

//admin route
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true })
})

//admin route
router.put('/profile', requireSignIn, updateProfileController)

//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
    "/order-status/:orderId",
    requireSignIn,
    isAdmin,
    orderStatusController
);

export default router