// import * as FileSystem from 'expo-file-system';
import axios from 'axios';
// import {decode, encode} from 'base-64'

class StorageClient {
    constructor(apiUrl = "http://192.168.1.10:8000") {
        this.apiUrl = apiUrl;
        this.mainDirectory = null
    }

    async addFile(file_name, file_size, file_mime_type, directory_path) {
        const data = {
            name: file_name,
            mimeType: file_mime_type,
            size: file_size,
            path: directory_path,
        };
        console.log(data);

        const response = await axios.post(`${this.apiUrl}/file`, data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async getFileData(file_path) {
        const response = await axios.get(`${this.apiUrl}/file`, {
            params: { filePath: file_path },
        });
        return response.data;
    }

    async getFileDataWithId(file_id) {
        const response = await axios.get(`${this.apiUrl}/file`, {
            params: { fileId: file_id },
        });
        return response.data;
    }

    async getCurrentDirectoryContents(directory_id = 1) {
        const response = await axios.get(this.apiUrl, { params: { dirId: directory_id } });
        return response;
    }

    async getDirectoryData(directory_path = null) {
        const params = directory_path ? { dirPath: directory_path } : {};
        const response = await axios.get(`${this.apiUrl}/directory`, { params });
        return response.data;
    }

    async makeNewDirectory(directory_path) {
        const data = { dirPath: directory_path };
        const response = await axios.post(`${this.apiUrl}/directory`, null, { params: data });
        return response.data;
    }

    async mergeAndWriteBinFiles(permissions, fileUris, outputFileName, fileMimeType) {
        try {
            // Read content of each .bin file and concatenate them
            const mergedContent = await Promise.all(
                fileUris.map(async (fileUri) => {
                    try {
                        const fileBinary = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
                        return Buffer.from(fileBinary, 'base64').toString('binary');
                    } catch (error) {
                        console.error(`Error reading file ${fileUri}: ${error}`);
                    }
                })
            );

            const finalContent = Buffer.from(mergedContent.join(""), 'binary').toString('base64');

            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, outputFileName, fileMimeType)
            .then(async (uri) => {
                await FileSystem.writeAsStringAsync(uri, finalContent, { encoding: FileSystem.EncodingType.Base64 });
            }).catch((e) => {
                console.log(e);
            });

            fileUris.map(async (fileUri) => {
                try {
                    await FileSystem.deleteAsync(fileUri)
                } catch (error) {
                    console.error(`Error reading file ${fileUri}: ${error}`);
                }
            })

            console.log(`Merged content written to ${outputFileName}`);
        } catch (error) {
            console.error(`Error merging and writing files: ${error}`);
        }
    }
    
    async downloadFileFromServer(file_id, progress, setProgress) {
        try {
            const file_data = await this.getFileDataWithId(file_id);
            console.log('Currently downloading => ', file_data.fileName);
            let chunks_id_list = file_data.chunksIds;
            let chunks_urls = []
          

            for (let chunk_data_index = 0; chunk_data_index < chunks_id_list.length; chunk_data_index++) {
                const chunk_id = chunks_id_list[chunk_data_index].chunkId;
                const chunk_name = chunks_id_list[chunk_data_index].chunkName;

                const response = await axios.get(`${this.apiUrl}/download`, {
                    params: { chunkId: chunk_id, isLink: true },
                });

                chunks_urls.push(response.data.url)
            }

            chunks_id_list.map((chunkObject, index) => {
                chunks_id_list[index].chunkUrl = chunks_urls[index]
            }); 
            
            setProgress({
                ...progress,
                progress: 0.0001,
                data: chunks_id_list,
                download: true
            })

            return new Promise((resolve) => {
                resolve(file_data)
            })

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    //checked unitl here
    
    async splitFile(input_file_path, chunk_size, output_directory) {
        try {
            const fileUri = FileSystem.documentDirectory + input_file_path;
            const file = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });

            if (!(await FileSystem.getInfoAsync(output_directory)).exists) {
                await FileSystem.makeDirectoryAsync(output_directory);
            }

            const chunk_number = 1;
            let start = 0;
            let end = chunk_size;

            while (start < file.length) {
                const chunk_data = file.substring(start, end);
                const chunk_filename = `${output_directory}/${input_file_path}_${chunk_number}.bin`;

                await FileSystem.writeAsStringAsync(
                    chunk_filename,
                    chunk_data,
                    { encoding: FileSystem.EncodingType.Base64 }
                );

                start = end;
                end = start + chunk_size;
            }

            return output_directory;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getFileSizeInBytes(file_path) {
        const fileInfo = await FileSystem.getInfoAsync(file_path);
        return fileInfo.size;
    }

    async getMimeType(file_path) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(file_path, { md5: false, mimeType: true });
          return fileInfo.mimeType || null;
        } catch (error) {
          console.error('Error getting MIME type:', error);
          return null;
        }
    }

    async uploadFileToServer(file_local_path, directory_path = '~') {
        try {
            const file_size = await this.getFileSizeInBytes(file_local_path);
            const file_mime_type = await this.getMimeType(file_local_path);
            const file_name = file_local_path.split('/').pop();

            const file_data = await this.addFile(file_name, file_size, file_mime_type, directory_path);

            const file_db_id = file_data.fileId;
            if (!file_db_id) {
                console.error(file_data.error);
                return null;
            }

            console.log('File data sent successfully.');
            const chunks_directory = await this.splitFile(file_local_path, 1024 * 1024 * 20, String(file_db_id));

            if (!chunks_directory) {
                console.error('Error splitting file.');
                return null;
            }

            console.log('File chunks created successfully.');
            if (await this.handleUploading(chunks_directory, file_db_id)) {
                console.log('File uploaded successfully.');
                return file_data;
            } else {
                console.error('Error uploading file.');
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async handleUploading(chunks_dir_path, parent_file_id) {
        try {
            const chunks_list = await FileSystem.readDirectoryAsync(chunks_dir_path);

            for (let chunk_index = 0; chunk_index < chunks_list.length; chunk_index++) {
                const chunk_filename = chunks_list[chunk_index];
                const data = {
                    fileId: parent_file_id,
                };

                const chunk_data = await FileSystem.readAsStringAsync(`${chunks_dir_path}/${chunk_filename}`, {
                    encoding: 'base64',
                });

                await axios.post(`${this.apiUrl}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                    data: { file: chunk_data },
                });
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}


function binaryToBase64(binary) {
    let base64 = '';
    for (let i = 0; i < binary.length; i++) {
        base64 += String.fromCharCode(binary.charCodeAt(i) & 0xff);
    }
    return encode(base64);
}

export default StorageClient;
