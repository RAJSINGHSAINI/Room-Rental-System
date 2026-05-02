import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';
import { transporter } from '../config/nodemailer.js';

// new user or register

export const register = async (req, res) => {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details " })
    }
    if (!address || !address.street || !address.city || !address.state || !address.pincode) {
        return res.json({
            success: false,
            message: "Please fill all address fields"
        });
    }

    try {

        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "User Already register " })
        }
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = new userModel({ name, email, password: hashedPassword, address })

        await user.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // welcome mail 
        const mailOptions = {
            from: process.env.SENDER,
            to: email,
            subject: 'welcome to my website',
            text: `welcome to my website. Your account has been successfully regitered with email id: ${email}`,
        }

        await transporter.sendMail(mailOptions)

        return res.json({ success: true, message: "seccessful" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'invalid email or password' })
    }

    try {

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'invalid email' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'invalid password' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({ success: true, message: user.isAccountVerified ? "verified" : 'not-verified' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        })
        return res.json({ success: true, message: 'Logged Out' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Account verification

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userID } = req;
        const { otpType, newEmail } = req.body;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Handle change email
        if (otpType === 'change-email') {

            if (!newEmail) {
                return res.json({ success: false, message: 'New email required' });
            }

            const checkUser = await userModel.findOne({ email: newEmail });
            if (checkUser) {
                return res.json({ success: false, message: 'Email already registered' });
            }

            // store temp email
            user.tempEmail = newEmail;
        }

        // Prevent re-verification only for normal verify
        if (otpType === 'verify-email' && user.isAccountVerified) {
            return res.json({ success: false, message: 'User already verified' });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        user.otpType = otpType;

        await user.save();

        const emailToSend = otpType === 'change-email' ? user.tempEmail : user.email;

        const mailOptions = {
            from: process.env.SENDER,
            to: emailToSend,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}. It expires in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { OTP, type } = req.body;
        const { userID } = req;

        if (!userID || !OTP || !type) {
            return res.json({ success: false, message: 'Missing details' });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.otpType !== type) {
            return res.json({ success: false, message: 'Invalid OTP type' });
        }

        // Prevent re-verification
        if (type === 'verify-email' && user.isAccountVerified) {
            return res.json({ success: false, message: 'User already verified' });
        }

        // Validate OTP
        if (!user.verifyOtp || user.verifyOtp !== OTP) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        if (type === 'verify-email') {
            user.isAccountVerified = true;
        }

        if (type === 'change-email') {
            user.email = user.tempEmail;
            user.tempEmail = '';
        }

        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        user.otpType = '';

        await user.save();

        return res.json({ success: true, message: 'email change successful' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenicated = (req, res) => {
    try {
        return res.json({ success: true })
    } catch (error) {
        return res.json({ success: false, message: error })
    }
}

// password reset OTP send functions

export const sendResetOtp = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' })
    }

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'User not Found' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp

        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER,
            to: user.email,
            subject: 'Account password reset OTP',
            text: `welcome to my website. Your account password reset verification otp is : ${otp}
            Expire in 15 minutes
            `,
        }

        await transporter.sendMail(mailOptions)

        return res.json({ success: true, message: 'OTP sent to your email' })

    } catch (error) {

        return res.json({ success: false, message: error })
    }

}

export const resetPassword = async (req, res) => {

    const { email, otp, newPassword } = req.body;

    if (!email, !otp, !newPassword) {
        return res.json({ success: false, message: 'Email, Otp and new Password are required' })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' })
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetOtp = ''
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: 'User password change successfully' })

    } catch (error) {
        return res.json({ success: false, message: 'OTP expired' })
    }

}