import React, {useEffect, useState} from 'react';
import styles from './index.module.scss';

const ComponentLoader = (props) => {

    const [isLoading, setIsLoading] = useState(props.loaderState);

    useEffect(() => {
        setIsLoading(props.loaderState);
    }, [props.loaderState])

    return (
        <>
        {isLoading && <div className="loader" role={'progressbar'}/>}
        </>
    );
}
export default ComponentLoader;
