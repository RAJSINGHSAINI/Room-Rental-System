import express from 'express'
import { addHome, getHome, getHomes, saveHome, delHome, getAllHomes, checkListHome, getWishHomes } from '../controllers/homeController.js';
import { userAuth } from '../middleware/userAuth.js';
import { uploadHomeImages } from '../config/multer.js';

export const homeRouter = express.Router();

homeRouter.post('/add-home', userAuth, uploadHomeImages, addHome);
homeRouter.put('/save-home', userAuth, uploadHomeImages, saveHome);
homeRouter.get('/get-homes', userAuth, getHomes);
homeRouter.get('/get-home/:id', userAuth, getHome);
homeRouter.get('/get-all-homes', userAuth, getAllHomes);
homeRouter.get('/check-lists-home/:homeID', userAuth, checkListHome);
homeRouter.get('/get-wish-homes', userAuth, getWishHomes);
homeRouter.delete('/del-home/:id', userAuth, delHome);