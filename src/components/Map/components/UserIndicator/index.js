import React from 'react';
import basic from './index.module.scss';

const UserIndicator = (props) => {
    const {extraStyles} = props;
    const styles = (className) => {
        return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
    }
    return (
    <div className={styles('user-indicator-wrapper')}>
        <div className={styles('user-inner-indicator')} />
    </div>);
};

export default UserIndicator;