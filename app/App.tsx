import React from 'react';
import {
    Text,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler
} from 'react-native';
import FileSystem from '../components/FileSystem';
import FileCard from './FileCard';
import { NativeRouter, Route, Routes } from "react-router-native";

function App(): React.JSX.Element {
    return (
        <NativeRouter>
            <Routes>
                <Route path='/' Component={FileSystem}></Route>
                <Route path='/FileCard' Component={FileCard}></Route>
            </Routes>
        </NativeRouter>
    )
};

export default App;
