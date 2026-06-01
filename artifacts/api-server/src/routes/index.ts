import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import spinnerRouter from "./spinner";
import tongueTwistersRouter from "./tongue-twisters";
import knowledgeTestRouter from "./knowledge-test";
import leaderboardRouter from "./leaderboard";
import adminRouter from "./admin";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/spinner", spinnerRouter);
router.use("/tongue-twisters", tongueTwistersRouter);
router.use("/knowledge-tests", knowledgeTestRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/admin", adminRouter);
router.use("/uploads", uploadsRouter);

export default router;
