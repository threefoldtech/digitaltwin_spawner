import {logger} from "../logger";
import Dockerode from "dockerode";


const docker = new Dockerode({socketPath: '/var/run/docker.sock'});

export const initDocker = async () => {
    await docker.pull('jimbersoftware/chat:0.4')
    const networks = await docker.listNetworks()
    if (!networks.find(n => n.Name === "chatnet")) {
        await docker.createNetwork({Name: 'chatnet'})
    }
}

export const spawnDocker = async (userId: string) => {
    const volumeName = `browser_storage${userId}`;


    try {
        await docker.createVolume({
            name: volumeName,
            labels: {'jimber': 'volume'}
        })
    } catch (e) {
        throw new Error('volumeError')
    }

    const options: Dockerode.ContainerCreateOptions = {
        Image: 'jimbersoftware/chat:0.4',
        Tty: true,
        name: `${userId}-chat`,
        HostConfig: {
            AutoRemove: true,
            NetworkMode: 'chatnet',
            Binds: [`${volumeName}:/root/.local/share/browser/QtWebEngine/Default`],
        },
        Env: [`USER_ID=${userId}`],
    };
    try {
        const container = await docker.createContainer(options);
        await container.start()
    } catch (err) {
        logger.error('error', {err})
        throw err
        throw new Error('createError')
    }
};
