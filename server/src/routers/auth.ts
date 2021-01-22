import {Router} from "express";
import {appCallback, getAppLoginUrl} from "../service/authService";
import {logger} from "../logger";

export const router = Router();

router.get('/signin', async (request, respose) => {
    console.log(request.rawHeaders)
    console.log(request.cookies)
    const loginUrl = await getAppLoginUrl(request, `/api/v1/auth/callback`);
    respose.redirect(loginUrl);
});

router.get('/callback', async (request, respose) => {
    console.log(request.rawHeaders)
    console.log(request.cookies)
    const callback = await appCallback(request);
    respose.redirect(callback);
});
