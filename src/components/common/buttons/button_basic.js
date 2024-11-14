import React from 'react';

const ButtonBasic  = ({className, btnText, onClick}) =>

    <div className={className} onClick={() => onClick()}>
        {btnText}
    </div>;

export default ButtonBasic;