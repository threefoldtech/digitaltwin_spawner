import {logger} from "../logger";
import Dockerode, { DeviceMapping } from "dockerode";
import * as fs from "fs";


const docker = new Dockerode({socketPath: '/var/run/docker.sock'});


export const initDocker = async () => {
    const networks = await docker.listNetworks()
    if (!networks.find(n => n.Name === "chatnet")) {
        await docker.createNetwork({Name: 'chatnet'})
    }
}

const getImage = () => {
    try {
        const image = fs.readFileSync('/config/version.txt').toString();
        return image.trim()
    } catch (err) {
        return 'jimbersoftware/chat:yggdrasil';
    }

};

export const spawnDocker = async (userId: string) => {
    const volumeName = `chat_storage_${userId}`;
    const containerName = `${userId}-chat`;
    const containerList = await docker.listContainers()
    if (containerList.find(c => c.Names.includes(containerName))) {
        return;
    }

    try {
        const list = await docker.listVolumes()
        if (!list.Volumes.find(v => v.Name === volumeName)) {
            await docker.createVolume({
                name: volumeName,
                labels: {'chat': 'volume'}
            })
        }
    } catch (e) {
        throw new Error('volumeError')
    }

    const containerAlreadyRunningPromise = new Promise((resolve) => {
        docker.listContainers((err, containers) => {
            resolve(!!containers.find(c => c.Names.includes(`/${containerName}`)))
        });
    })


    const containerAlreadyRunning = await containerAlreadyRunningPromise;
    if (containerAlreadyRunning) {
        return
    }

    const image = getImage()
    logger.info(`spawn: ${image}`)
    const options: Dockerode.ContainerCreateOptions = {
        Image: image,
        Tty: true,
        name: containerName,
        HostConfig: {
            AutoRemove: true,
            NetworkMode: 'chatnet',
            Sysctls: {'net.ipv6.conf.all.disable_ipv6':'0'},
            CapAdd:'NET_ADMIN',
            Devices: <DeviceMapping[]> [{
                PathOnHost: '/dev/net/tun',
                PathInContainer: '/dev/net/tun',
                CgroupPermissions: 'rwm'
            }],
            Binds: [`${volumeName}:/appdata`],
        },
        Env: [`USER_ID=${userId}`],
    };
    try {
        const container = await docker.createContainer(options);
        await container.start()
    } catch (err) {
        logger.error('error', {err})
        throw err
    }
};

export const fetchChatList = async () => {
    const containers: Dockerode.ContainerInfo[] = await docker.listContainers()
    return containers
        .map((container: Dockerode.ContainerInfo) => container?.Names[0])
        .filter(containerName => containerName.indexOf("-chat") !== -1)
        .map(n => n.replace('-chat', ''))
        .map(n => n.replace('/', ''))
        .map(n => n.trim())
}
