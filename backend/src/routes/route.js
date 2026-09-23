import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { articleController } from '../controllers/articleController.js';
import { login } from '../controllers/authController.js';
import { refreshAccessToken } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/jwtAuth.js';

export const router = Router();
/* ---------------------- AUTH ROUTES */

router.route('/signup').post(userController.createUsers);
router.route('/login').post(login);
router.post('/refresh', refreshAccessToken);
router.post('/log-out', userController.logout);

/* --------------------USER ROUTES ---------------------------- */

router.route('/users').get(verifyToken, userController.getAllUsersDetails);
router.route('/users/me').get(verifyToken, userController.getCurrentUser);
router.route('/users/:id').get(verifyToken, userController.getUserById);

/* ----------------- ARTICLE ROUTES ------------------------------------ */

router.route('/articles').post(verifyToken, articleController.createPost).get(articleController.getArticle); /* <----- */
router.put('/articles/:id', articleController.articlesUpdate);
router.delete('/articles/:id', articleController.articlesDelete);
router.get('/articles/:articleId/comments', articleController.userCommentsGet);
