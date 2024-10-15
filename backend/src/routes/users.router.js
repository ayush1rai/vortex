import { Router } from "express"
import { loginUser, registerUser, logoutUser, refreshToken, changeCurrentPassword, getCurrentUser, updateAccountDetails } from "../controllers/users.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([{
        name : "profileImage",
        maxCount : 1
    }]),
    registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyjwt, logoutUser)
router.route("/refresh-token").post(refreshToken)
router.route("/user-details").get(verifyjwt, getCurrentUser)
router.route("/change-password").post(verifyjwt, changeCurrentPassword)
router.route("/update-account-details").patch(verifyjwt, updateAccountDetails)

export default router