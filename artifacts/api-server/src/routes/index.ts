import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateRouter from "./generate/index";
import atsRouter from "./ats/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateRouter);
router.use(atsRouter);

export default router;
