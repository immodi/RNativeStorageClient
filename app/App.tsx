import React from 'react';
import {
    Text,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler
} from 'react-native';
import FileSystem from '../components/FileSystem';


function App(): React.JSX.Element {
    return (
        // <View className='bg-white w-screen min-h-screen h-screen'>
        //     <Text className='text-lg text-red-700'>Hello world</Text>
        // </View>
        <FileSystem />    
    )
};

export default App;
