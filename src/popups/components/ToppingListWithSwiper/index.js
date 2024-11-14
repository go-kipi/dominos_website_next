import React, { useEffect, useRef, useState } from 'react'
import styles from "./index.module.scss";
import ToppingSelector from 'components/ToppingSelector';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import LanguageDirectionService from 'services/LanguageDirectionService';
import { getFullMediaUrl, parseCoverage } from 'utils/functions';
import { MEDIA_ENUM } from 'constants/media-enum';
import { META_ENUM } from 'constants/menu-meta-tags';
import { MEDIA_TYPES } from 'constants/media-types';
import ActionTypes from 'constants/menus-action-types';
import { useSelector } from 'react-redux';
import useMenus from 'hooks/useMenus';
import clsx from 'clsx';

SwiperCore.use([Navigation]);

import NextArrow from "/public/assets/icons/next-arrow.svg";
import PrevArrow from "/public/assets/icons/prev-arrow.svg";

function ToppingListWithSwiper({ toppings = [], setToppings, hideSeparators = false }) {
    const languageFlag = useSelector((store) => store.languageFlag);
    const [navigationArrows, setNavigationArrows] = useState();
    const swiperRef = useRef();
    const navigationPrevRef = useRef();
    const navigationNextRef = useRef();

    useEffect(() => {
        if (navigationNextRef.current && navigationPrevRef.current) {
          const navigation = {nextEl: navigationNextRef.current, prevEl: navigationPrevRef.current }
          setNavigationArrows(navigation);
        }
      }, [navigationNextRef.current, navigationPrevRef.current])
    
      useEffect(() => {
        if (swiperRef.current) {
          window.addEventListener("resize", onWindowResize);
        }
        return () => {
          if (swiperRef.current) {
            window.removeEventListener("resize", onWindowResize);
          }
        };
      }, [swiperRef.current]);
    
      useEffect(() => {
        if (swiperRef.current) {
          swiperRef.current.changeLanguageDirection(
            LanguageDirectionService.isRTL() ? "rtl" : "ltr"
          );
        }
      }, [languageFlag, swiperRef.current]);
    
      function onWindowResize() {
        if (swiperRef.current) {
          swiperRef.current.updateSize();
        }
      }

      const getSwiperSlides = () => {
        const slides = [];
        if (Array.isArray(toppings)) {
            for (let i = 0; i < toppings.length; i++) {
              const subitem = toppings[i];
              const secondSubitem = toppings[i + 1];
              const slideToPush = (
                <SwiperSlide key={`slide-${i}`}>
                  {subitem &&
                  <RenderItem
                    item={subitem}
                    isOnSwiper
                    key={"topping-" + i}
                    setToppings={setToppings}
                  />}
                  {secondSubitem &&
                  <RenderItem
                    item={secondSubitem}
                    isOnSwiper
                    key={"topping-" + (i+1)}
                    setToppings={setToppings}
                  />}
              </SwiperSlide>
              )
              slides.push(slideToPush);
              ++i;
            }
        }
        return slides;
      }

    return(
        <div className={styles['slider-wrapper']}>
          <div className={styles['arrows']}>
            <button
              ref={LanguageDirectionService.isRTL() ? navigationPrevRef: navigationNextRef}
              className={clsx(styles["prev-arrow-wrapper"], styles["arrow"])}>
              <img
                className={styles["prev-arrow"]}
                src={PrevArrow.src}
              />
            </button>
            <button
              ref={LanguageDirectionService.isRTL() ? navigationNextRef : navigationPrevRef}
              className={clsx(styles["next-arrow-wrapper"], styles["arrow"])}>
              <img
                className={styles["next-arrow"]}
                src={NextArrow.src}
              />
            </button>
          </div>
          {!hideSeparators ? <div className={styles["separator"]} /> : null}
            {navigationArrows &&
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              className={styles['toppings-swiper']}
              slidesPerView={4}
              slidesPerGroup={4}
              navigation={navigationArrows}>
              {getSwiperSlides()}
            </Swiper>}
          {!hideSeparators ? <div className={styles["separator"]} /> : null}
        </div>
      )
}

export default ToppingListWithSwiper;

function RenderItem(props) {
    const { item, setToppings, isOnSwiper = false } = props;
    const product = useMenus(item.productId, ActionTypes.PRODUCT);
    const [topping, setTopping] = useState({});
    const imageUrl = getFullMediaUrl(
      topping,
      MEDIA_TYPES.PRODUCT,
      MEDIA_ENUM.IN_MENU
    );
  
    useEffect(() => {
      if (item) {
        onToppingsCovarge();
      }
    }, [item]);
  
    useEffect(() => {}, []);
  
    function onToppingsCovarge() {
      if (item.productId) {
        const coverage = parseCoverage(item.quarters);
        const topping = {
          id: item.productId,
          coverage,
          quantity: item.quantity,
          assetVersion: product.assetVersion,
        };
        setToppings((prevState) => {
          return [...prevState, topping];
        });
        setTopping(topping);
      }
    }
  
    if (META_ENUM.PIZZA_PREP !== product?.meta) {
      return (
        <ToppingSelector
          product={product}
          coverage={topping?.coverage}
          isDraggable={false}
          image={imageUrl}
          clicked
          id={product.id}
          isOnPizza
          isOnSwiper={isOnSwiper}
          showCloseIcon={false}
          className={isOnSwiper ? styles['on-swiper'] : ''}
        />
      );
    } else {
      // not a topping
      return null;
    }
  }