import React from 'react';
import styles from './index.module.scss';

const ImagePlaceholder  = ({x,y,className = ''}) =>

    <div className= {"image_placeholder " + className}>
        <span>{x}</span>
        <span>x</span>
        <span>{y}</span>
    </div>;

export default ImagePlaceholder;