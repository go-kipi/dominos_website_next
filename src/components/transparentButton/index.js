import React from "react";
import styles from './index.module.scss';
import clsx from "clsx";

const TransparentButton = ({icon, text, onClick, className, animation}, ref)  => {

    return (
        <div className={clsx(styles['transparent-button-container'], className)} style={animation} ref={ref}>
            <button className={styles['inner-container']} onClick={onClick}>
                {
                    icon &&
                        <img
                            className={styles['icon']}
                            src={icon.src}
                        />
                }
                {
                    text &&
                        <span className={styles['text']}>{text}</span>
                }
            </button>
        </div>
    )
}

const TransparentButtonComponent = React.forwardRef(TransparentButton);

export default TransparentButtonComponent;
