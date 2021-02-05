import {Router} from "express";
import {fetchChatList} from "../service/dockerService";

export const router = Router();

router.get('/', async (request, respose) => {
    const digitaltwins = await fetchChatList()
    respose.json(digitaltwins)
});
