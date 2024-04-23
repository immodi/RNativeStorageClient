import { useEffect, useState } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function useBaseDirectory() {
    const [permissions, setPermissions] = useState(null);


    useEffect(() => {
        createBaseDirctory().then(res => {
            setPermissions(res)
        })
    }, [])
    
    return permissions

}   


const createBaseDirctory = async () => {
    try {
        let storedPermissions = await getObjectData('directoryPermissions');

        if (storedPermissions === null) {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                return new Promise((resolve, reject) => {
                    resolve(false)
                });
            }

            // // await FileSystem.StorageAccessFramework.makeDirectoryAsync(permissions.directoryUri, 'Storage Client');
            // // let modifiedBaseUri = permissions.directoryUri+"%2FStorage%20Client"
            
            // // let baseDirectoryUri = `${modifiedBaseUri}/document/primary${modifiedBaseUri.split("/primary")[1]}` 
            // // //fkin black magic to get the base directory uri
            
            // permissions = {...permissions, directoryUri: baseDirectoryUri}

            await storeObjectData('directoryPermissions', permissions)  

            return new Promise((resolve, reject) => {
                resolve(permissions)
            })
        }

        return new Promise((resolve, reject) => {
            resolve(storedPermissions)
        })

    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => {
            reject(err)
        })
    }
}



const storeStringData = async (key, value) => {
    try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue === null) {
            await AsyncStorage.setItem(key, value);
            return new Promise((resolve, reject) => {
                resolve(true)
            })    
        }
        else {
            await AsyncStorage.setItem(key, value);
            return new Promise((resolve, reject) => {
                resolve(false)
            })
        }
    } catch (e) {
        console.log(e);
        return new Promise((resolve, reject) => {
            reject(e)
        })
    }
};

const storeObjectData = async (key, obj) => {
    try {
        const storedValue = await getObjectData(key);
        if (storedValue === null) {
            const jsonValue = JSON.stringify(obj);
            await AsyncStorage.setItem(key, jsonValue);
            return new Promise((resolve, reject) => {
                resolve(true)
            })
        }
        return new Promise((resolve, reject) => {
            resolve(false)
        })
    } catch (e) {
        console.log(e);
        return new Promise((resolve, reject) => {
            reject(e)
        })
    }
};

const getStringData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return new Promise((resolve, reject) => {
                resolve(value);
            })
        } else {
            return new Promise((resolve, reject) => {
                resolve(null)
            })
        }
    } catch (e) {
        console.log(e);
        return new Promise((resolve, reject) => {
            reject(e)
        })
    }
};

const getObjectData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log(e);
        return new Promise((resolve, reject) => {
            reject(e)
        })
    }
  };

const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    } catch (error) {
        console.log(e);
        return new Promise((resolve, reject) => {
            reject(e)
        })
    }
}
