import React, {Component} from 'react';

export const Picture = ((props) => {
    let style = {
        position:'relative',
        height: 0,
        paddingBottom: (props.y / props.x)*100 + '%'
    }

    let style2 = {
        position: 'absolute',
        top:0,
        bottom:0,
        right:0,
        left:0,
    }
    return (
        <div style={ style }>
            <div style = { style2 }>
                { props.children }
            </div>
        </div>
    )
})