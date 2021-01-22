import {
    Router,
    Request,
    Response
} from "express";
import {spawnDocker} from "../service/dockerService";
import {authMiddleware} from "../middleware/auth";

export const router = Router()

router.post("/spawn", [authMiddleware], async (req: Request, res: Response) => {
    await spawnDocker(req.session.userId);
    res.json({success: true, redirectUrl: `https://${req.session.userId}.digitaltwin.jimbertesting.be`})
});
