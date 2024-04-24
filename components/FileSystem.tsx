import React, { useEffect, useState } from 'react';
import { FileSystemItem } from '../interfaces/FileSystemItems';
import getFileSystem from '../helpers/GetData';
import Stack from '../helpers/Stack';
import { useNavigate } from 'react-router-native';

import {  
    FlatList,
    TouchableOpacity,
    BackHandler,
    View,
    Text
} from "react-native";

function FileSystem() {
    const [fileSystemData, setFileSystemData] = useState<FileSystemItem[]>([]);
    const [directorysHistoryStack, setDirectorysHistoryStack] = useState(new Stack(1));
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    let navigate = useNavigate();

    useEffect(()=> {
        getFileSystem(1, setFileSystemData);
        BackHandler.addEventListener("hardwareBackPress", () => {
            let newStack = directorysHistoryStack.pop()
            if (newStack) {
                refreshFileSystem(newStack, setFileSystemData, setDirectorysHistoryStack, setLoading);
                console.log("removed item");
            }
            return true
        })
    }, [])
    
    useEffect(() => {
        setLoading(false)
    }, [fileSystemData])


    const handleItemPress = (item: FileSystemItem) => {          
        setSelectedItem(item);
        if (item.type === 'folder' && directorysHistoryStack.peek() !== item.dbId) {
            refreshFileSystem(
                directorysHistoryStack.push(item.dbId),
                setFileSystemData,
                setDirectorysHistoryStack,
                setLoading
            );
        
            console.log("added new item");
        }

        if (item.type === 'file') {            
            navigate('FileCard', {
                state: {
                    id: item.dbId,
                    name: item.name,
                    size: getItemSizeString(item.size)
                },
            });
        }
    };

    const renderItem = ({ item }: {item: FileSystemItem}) => (
        <TouchableOpacity onPress={() => handleItemPress(item)}>
            <View className='p-2 border-b flex-row flex border-gray-300'>
                <Text className='text-base'>
                    {item.type === 'folder' ? '📁 ' : '📄 '}
                    {item.type === 'folder'? getBaseName(item.name) : item.name}
                </Text> 
                {item.type === 'file' && <Text className='text-sm ml-auto'>{getItemSizeString(item.size)}</Text>}
            </View>
        </TouchableOpacity>
    );
    

    return (
        !loading
        ?
        <View className='flex-1'>
            <Text className='text-xl font-bold p-4'>File System</Text>
            {
                fileSystemData
                ?
                    (fileSystemData.length === 0)
                    ?
                    <View className='flex flex-grow items-center justify-center'>
                        <Text className='text-2xl font-bold'>Empty Directory</Text>
                    </View>
                    :
                    <FlatList
                        data={fileSystemData}
                        renderItem={renderItem}
                        keyExtractor={(item: any) => item.id}
                    />
                :
                <View className='flex flex-grow items-center justify-center'>
                    <Text className='text-2xl font-bold'>An Error Occured :/</Text>
                </View>
            }
        </View>
        :
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl font-bold'>Loading...</Text>
        </View>
    
    );
};


function refreshFileSystem(newStack: Stack<number> | null, setFileSystemData: any, setDirectorysHistoryStack: any, setLoading: any) {
    setLoading(true)    
    if (newStack) getFileSystem(newStack.peek(), setFileSystemData)
    setDirectorysHistoryStack(newStack)
}

const getBaseName = (path: string): string => {
    return path.split("/")[path.split("/").length-1]
}


const getItemSizeString = (bytes: number): string => {
    if (bytes < 1024 && bytes >= 0) {
        return `${bytes} B`;

    } else if (bytes < Math.pow(1024, 2) && bytes >= 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    
    } else if (bytes < Math.pow(1024, 3) && bytes >= Math.pow(1024, 2)) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    
    } else if (bytes < Math.pow(1024, 4) && bytes >= Math.pow(1024, 3)) {
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    
    } else {
        return `NaN`;
    }
}


export default FileSystem