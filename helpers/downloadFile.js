import * as FileSystem from 'expo-file-system';

export default async function downloadFile(permissions, progress, setProgress) {    

    let downloadUrl =  progress.data[progress.currentIteration].chunkUrl
    let fileName = progress.data[progress.currentIteration].chunkName
    let fileMimeType = "application/octet-stream"
    // let fileMimeType = progress.data[progress.currentIteration].chunkMimeType
    
    const downloadResumable = createDownloadResumable(downloadUrl, fileName, 1/progress.data.length, progress, setProgress)

    return await startDownloading(permissions, downloadResumable, fileName, fileMimeType, progress, setProgress)
}


const startDownloading = async (permissions, downloadResumable, fileName, fileMimeType, progress, setProgress) => {
    try {
        if (permissions) {
            const { uri } = await downloadResumable.downloadAsync();
            return await saveAndroidFile(permissions, uri, fileName, fileMimeType, progress, setProgress);
        }
    } catch (e) {
        console.error(e);
    }
}


const createDownloadResumable = (url, fileName, ratio, progress, setProgress) => {
    const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.cacheDirectory + fileName,
        {},
        (progressObject) => {callback(progressObject, ratio, progress, setProgress)}
    );

    return downloadResumable
}

const saveAndroidFile = async (permissions, fileUri, fileName, fileMimeType, progress, setProgress) => {
    try {
        // const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(baseDirectoryUri);
        if (!permissions.granted) {
            console.log("permissions not granted");
            return;
        }
        
        try {
            console.log("got permissions saving");
            const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
            let outputFileUri = null
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, fileMimeType)
            .then(async (uri) => {
                await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
                // alert(`File ${fileName} saved in ${permissions.directoryUri}`);
                if (progress.currentIteration < progress.data.length) {
                    setProgress({
                        ...progress,
                        progress: progress.progress + 1/progress.data.length,
                        currentIteration: progress.currentIteration + 1,
                    })
                }
                outputFileUri = uri
            }).catch((e) => {
                console.log(e);
            });
            return new Promise((resolve, reject) => {
                resolve(outputFileUri)
            })
        } catch (e) {
            throw new Error(e);
        }
    } catch (err) {
        console.log(err);
    }
}

const callback = (downloadProgress, ratio, progress, setProgress) => {
    const progressDone = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * ratio;
    console.log(progressDone+progress.progress);
    setProgress({
        ...progress,
        progress: progressDone+progress.progress,
        download: false
    })
};

