import React,{ useEffect, useState,useMemo } from 'react';
import { Navigate, Route,Outlet,useLocation } from 'react-router-dom';
import Header from "../components/Header";
import Cookies from "js-cookie";

const ResetProtection = ({ element: Element, ...rest})=>{

    const location = useLocation();
    const [run,changeRun] = useState(false)

    useEffect(() => {
        const test = async() =>{
            await fetch('/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then((response) => {
                    if (response.ok) {
                        changeRun(true)
                    }
                    else{
                        changeRun(true)
                    }
            });

        }
        test()
    }, [location.pathname]);
    


    return <Outlet /> ;


}

export default ResetProtection;