import React, {useEffect, useLayoutEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import Actions from "redux/actions";
import styles from "./index.module.scss"

export default function MovingImage(props) {
    const animationRef = useRef();
    const animationsArr = useSelector((store) => store.animationArray);
    const { payload = {}, id = '' } = props;
    const { from = {}, to = {}, image = '' } = payload;
    const dispatch = useDispatch();

    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.style.width = `${from.width}px`;
            animationRef.current.style.height = `${from.height}px`;
            animationRef.current.style.top = `${from.py}px`;
            animationRef.current.style.left = `${from.left}px`;
                const parent = setTimeout(() => {
                    animate();
                    clearTimeout(parent);
                }, 15);
        }
    }, [animationRef.current]);

    const animate = () => {
        const isExists = animationsArr.find((anim => anim.id === id));
        if (animationRef.current) {
            animationRef.current.style.width = `${to.width}px`;
            animationRef.current.style.height = `${to.height}px`;
            animationRef.current.style.top = `${to.py}px`;
            animationRef.current.style.left = `${to.left}px`;
            const timeout = setTimeout(() => {
                if (isExists) {
                    dispatch(Actions.removeAnimation(id));
                }
                clearTimeout(timeout);
            }, 720);
        }
    }

    return (
        <div ref={animationRef} className={"moving-product-image"}>
            <img src={image} />
        </div>
    );
}
