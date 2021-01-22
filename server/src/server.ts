import express from "express";
import morgan from "morgan";
import {logger} from "./logger";
// eslint-disable-next-line @typescript-eslint/naming-convention
import session from "express-session";
import {router as authRouter} from "./routers/auth";
import {router as spawnRouter} from "./routers/spawn";
import {initDocker} from "./service/dockerService";


const init = async () => {

    const app = express();

    app.enable('trust proxy');

    app.use(morgan('short', {
        stream: {
            write: (text: string) => {
                logger.http(text)
            }
        }
    }))

    app.use(express.json());

    app.use(session({
        secret: 'secretpassphrase',
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            path: "/api/v1",
            secure: true,
            httpOnly: true
        }
    }));


    await initDocker()
    app.use("/api/v1", spawnRouter)

    app.use('/api/v1/auth', authRouter)

    app.listen(8080, () => {
        logger.info(`server started at http://localhost:8080`);
    });

}


void init();
