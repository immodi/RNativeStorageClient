import StorageClient from './StorageAPIClient';
import {FileSystemItem, APIFileItem, APIDirectoryItem} from '../interfaces/FileSystemItems';

export default async function getFileSystem(currentDirectoryId: number | null, setFileSystemData: any) {
    let client = new StorageClient("http://192.168.1.10:8000")
    if (currentDirectoryId === null) currentDirectoryId = 1
    const response = await client.getCurrentDirectoryContents(currentDirectoryId)

    if (response.status === 200) {
        let fileSystem: FileSystemItem[] = []
        let filesArray: APIFileItem[] = response.data.pop()
        let directorysArray: APIDirectoryItem[] = response.data;
        let dataId = 0

        directorysArray.forEach(directoryObject  => {
            dataId += 1
            fileSystem.push({
                id: dataId,
                name: directoryObject.dirPath,
                type: 'folder',
                dbId: directoryObject.dirId,
                size: 0
            })
        });

        filesArray.forEach(fileObject => {
            dataId += 1
            fileSystem.push({
                id: dataId,
                name: fileObject.fileName,
                type: 'file',
                size: fileObject.fileSize,
                dbId: fileObject.fileId
            })
        });

        setFileSystemData(fileSystem)
    } else {
        setFileSystemData(null)
    }
}