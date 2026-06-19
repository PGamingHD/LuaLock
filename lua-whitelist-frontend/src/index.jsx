import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import reportWebVitals from './storage/reportWebVitals';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

//WEB PAGES
import Homepage from './homepage';
import Error from './error';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={
        createBrowserRouter([{
            path: "/",
            element: <Homepage />
        }, {
            path: "*",
            element: <Error />
        }])
    } />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
