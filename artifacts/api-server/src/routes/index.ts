import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateRouter from "./generate/index";
import atsRouter from "./ats/index";
import interviewRouter from "./interview/index";
import salaryRouter from "./salary/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateRouter);
router.use(atsRouter);
router.use(interviewRouter);
router.use(salaryRouter);

export default router;
