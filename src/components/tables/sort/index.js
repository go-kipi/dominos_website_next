import React from 'react';
import './index.css';

const Sorting  = ({className = '', table_key, onClick, active }) =>
    <div className = {"sort " + className}>
        <div className = {"spinner up" + (active === 1 ? ' active' : '')}
             onClick = { () => onClick(table_key, 1) }></div>
        <div className = {"spinner down" + (active === 0 ? ' active' : '')}
             onClick = { () => onClick(table_key, 0) }></div>
    </div>;

export default Sorting;