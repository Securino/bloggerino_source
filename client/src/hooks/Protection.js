import React,{ useEffect, useState,useMemo } from 'react';
import { Navigate, Route,Outlet,useLocation } from 'react-router-dom';
import Header from "../components/Header";

import Cookies from 'js-cookie'; // import the js-cookie library

const Protection = ({ element: Element, ...rest })=>{
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [run,changeRun] = useState(false)
    const location = useLocation();

    useEffect(() => {
        const test = async() =>{
            const token = Cookies.get('token')
            await fetch('/validate-token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }})
                .then((response) => {
                    if (response.ok) {
                        setIsAuthenticated(true)
                        changeRun(true)
                    }
                    else{
                        setIsAuthenticated(false)
                        changeRun(true)
                    }
                });
        }
        test()
    }, [location.pathname]);

    if(!run){
        return null;
    }


    return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" />;


}

export default Protection;