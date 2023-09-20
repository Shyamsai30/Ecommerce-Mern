import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from 'jsonwebtoken';


export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body

        //validations
        if (!name) {
            return res.send({ message: 'Name is Required' });
        }
        if (!email) {
            return res.send({ message: 'Email is Required' });
        }
        if (!password) {
            return res.send({ message: 'Password is Required' });
        }
        if (!phone) {
            return res.send({ message: 'Phone number is Required' });
        }
        if (!address) {
            return res.send({ message: 'Address is Required' });
        }
        if (!answer) {
            return res.send({ message: 'Answer is Required' });
        }

        //check user
        const existingUser = await userModel.findOne({ email })
        //existingUser
        if (existingUser) {
            res.status(200).send({
                success: false,
                message: 'Already Registered User',
            })
        }
        //register user
        const hashedPassword = await hashPassword(password)
        //save
        const user = await new userModel({ name, email, phone, address, password: hashedPassword, answer }).save()
        res.status(201).send({
            success: true,
            message: "User Registered Succesfully",
            user
        })


    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in registration',
            err
        })
    }
};

//login
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const user = await userModel.findOne({ email })
        // check user in database
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            });
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Password is incorrect'
            });
        }

        //token create
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d", })

        res.status(200).send({
            success: true,
            message: "Login Successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        })

    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in Login',
            err
        })
    }
}

//forgot-password
export const forgotController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            res.status(400).send({ message: 'Email is Required' })
        }
        if (!answer) {
            res.status(400).send({ message: 'Answer is Required' })
        }
        if (!newPassword) {
            res.status(400).send({ message: 'NewPassword is Required' })
        }
        //check
        const user = await userModel.findOne({ email, answer })
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Wrong Email or Answer'
            })
        }
        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: 'Password Reset Successful'
        })
    } catch (err) {
        console.log(err)
        res.status(500).send({
            success: false,
            message: 'Something went Wrong',
            err
        })
    }
}

//testController

export const testController = (req, res) => {
    try {
        res.send('Protected Routes')
    } catch (err) {
        console.log(err)
        res.send({ err })
    }

}

//profile controller
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body
        const user = await userModel.findById(req.user._id)
        //password

        if (password && password.length < 5) {
            return res.json({ error: 'Password is required and 5 character long' })
        }
        const hashedPassword = password ? await hashPassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            address: address || user.address,
            phone: phone || user.phone
        }, { new: true })
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            success: false,
            message: 'Error in updating profile',
            err
        })
    }
}

//orders
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate("products", "-photo")
            .populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error WHile Geting Orders",
            error,
        });
    }
};
//orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: "-1" });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error WHile Geting Orders",
            error,
        });
    }
};

//order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error While Updateing Order",
            error,
        });
    }
}