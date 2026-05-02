import express from 'express'
import { userAuth } from '../middleware/userAuth.js';
import {  getUserData, updateUserData, wish } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data',userAuth,getUserData)
userRouter.post('/wish',userAuth,wish)
userRouter.put('/update-data',userAuth,updateUserData)

export default userRouter