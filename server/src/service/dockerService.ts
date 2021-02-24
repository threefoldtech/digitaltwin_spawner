import {logger} from "../logger";
import Dockerode from "dockerode";


const docker = new Dockerode({socketPath: '/var/run/docker.sock'});

const image = 'jimbersoftware/chat:yggdrasil';


export const initDocker = async () => {
    const networks = await docker.listNetworks()
    if (!networks.find(n => n.Name === "chatnet")) {
        await docker.createNetwork({Name: 'chatnet'})
    }
}

export const spawnDocker = async (userId: string) => {
    const volumeName = `chat_storage_${userId}`;
    const containerName = `${userId}-chat`;
    const containerList = await docker.listContainers()
    if (containerList.find(c => c.Names.includes(containerName)))
    {
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

    const options: Dockerode.ContainerCreateOptions = {
        Image: image,
        Tty: true,
        name: containerName,
        HostConfig: {
            AutoRemove: true,
            NetworkMode: 'chatnet',
            Sysctls: {'net.ipv6.conf.all.disable_ipv6':'0'},
            CapAdd:'NET_ADMIN',
            Devices: ['/dev/net/tun'],
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
