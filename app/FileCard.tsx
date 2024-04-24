import { Text, View, Button, BackHandler } from 'react-native';
import { useEffect, useState } from 'react';
import * as Progress from 'react-native-progress';
// import useBaseDirectory from "../helpers/hooks/useBaseDirectory";
// import downloadFile from "../helpers/downloadFile";
// import StorageClient from "../helpers/StorageAPIClient";
import { useNavigate, useLocation } from 'react-router-native';

const FileCard = () => {
    // const client = new StorageClient("http://192.168.1.10:8000");
    // const permissions = useBaseDirectory();
    let navigate = useNavigate()
    let location = useLocation()
    let itemData = location.state
    const [fileData, setFileData] = useState({}) 
    const [buttonText, setButtonText] = useState('Download');
    const [filesUris, setFilesUris] = useState([]);
    const [progress, setProgress] = useState({
        progress: 0,
        currentIteration: 0,
        data: null,
        download: false
    });


    useEffect(()=> {
        BackHandler.addEventListener("hardwareBackPress", () => {
            navigate(-1)
            return true
        })

        // client.permissions = permissions
        // client.setProgress = setProgress
    }, [])

    // useEffect(() => {
    //     if (progress.data && progress.progress > 0 && progress.currentIteration < progress.data.length && progress.download) {
    //         downloadFile(permissions, progress, setProgress).then(async (outFileUri) => {
    //             setFilesUris((filesUris) => [...filesUris, outFileUri])
    //         })
    //     }
    //     if (progress.progress < 1 && progress.data) {
    //         setButtonText("Cancel")
    //     }

    //     if (progress.progress >= 1 && progress.data && filesUris.length !== progress.data.length) {
    //         setButtonText("Combining Files...")
    //     }

    // }, [progress])

    // useEffect(() => {
    //     if (progress.data && filesUris.length === progress.data.length && fileData) {
    //         console.log("merging");
    //         let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
            
    //         // edit to make it take the current file data
    //         client.mergeAndWriteBinFiles(permissions, filesUris.sort(collator.compare), itemData.name, fileData.fileMimeType)
    //         .then(() => {
    //             setButtonText("Done")
    //         })
    //     }
    // }, [filesUris])

    // const onDownload = () => {
        
    //     client.downloadFileFromServer(itemData.id, progress, setProgress).then(fileData => {
    //         setFileData(fileData)
    //     })      
    //     let rawContentArray = [];

    // }

    // const cancelDownload = () => {
    //     setProgress(0)
    // }

   

    return (
        <View className="flex flex-col justify-start w-full h-full border border-gray-200 rounded-lg p-4">
            <View className="flex justify-start h-5/6 mb-5">
                <Text className="mt-3 mb-3 text-lg font-medium">FileName: {itemData.name}</Text>
                <Text className="mt-3 mb-3 text-gray-500">FileSize: {itemData.size}</Text>
            </View>
            
            {/* <View className="h-1/6 relative flex flex-col justify-end">
            </View> */}

            <View className="h-1/6 relative bottom-7 flex flex-col justify-end">
                {
                    (progress.progress < 1 && progress.progress > 0) && <Progress.Bar progress={progress.progress} width={null} className="relative bottom-5"/>
                }
                <Button
                    title={buttonText}
                    // onPress={progress.progress === 0 ? onDownload : cancelDownload}
                    disabled={(buttonText === 'Done')}
                />
            </View>
        </View>
    );
};



export default FileCard;
