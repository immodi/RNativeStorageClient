interface FileSystemItem {
    id: number;
    type: 'folder' | 'file';
    name: string;
    dbId: number;
    size: number;
}

interface APIFileItem {
    fileId: number;
    fileName: string;
    fileSize: number;
}


interface APIDirectoryItem {
    dirPath: string
    dirId: number
}

export type {FileSystemItem, APIDirectoryItem, APIFileItem};