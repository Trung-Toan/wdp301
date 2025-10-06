import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../common/header/user/Header';

const HomePage = () => {
    return (
        <div style={{backgroundColor: "f8f9fa"}}>
            <Header />
            <Outlet/>
        </div>
    );
};

export default memo(HomePage);