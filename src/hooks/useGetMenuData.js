import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Api from "api/requests";
import { notEmptyObject } from "utils/functions";

export default function useGetMenuData({
  id,
  shouldUseMenus = false,
  isInBuilder = false,
  showLoader = true,
}) {
  const isRequesting = useRef([]);
  const menus = useSelector((store) => store.menusData.menus);
  const idLength = Array.isArray(id) ? id.length : 1;

  const sendGetMenuRequest = (id, executeNow = false) => {
    const callback = () => isRequesting.current.pop();

    const payload = { menuId: id };
    if (isInBuilder) {
      payload.isInBuilder = true;
    }

    if (id === "recommendedKits") {
      callback();
      return {};
    }
    if (shouldUseMenus) {
      return Api.getMenus({
        payload,
        callback,
      });
    } else {
      return Api.getMenu({
        payload,
        config: { showLoader: !!showLoader, executeNow: executeNow },
        callback,
      });
    }
  };

  function handleSingleMenuId(id, executeNow) {
    if (typeof id === "string" && id.length > 1) {
      const menuData = menus ? menus[id] : undefined;
      if (typeof menuData === "object") {
        return menuData;
      } else if (isRequesting.current.length < idLength) {
        isRequesting.current.push(1);

        return sendGetMenuRequest(id, executeNow);
      } else {
        // console.warn('no menu id found', id);
        return false;
      }
    }
    return {};
  }

  function isOneMenuEmpty(multipleMenus) {
    for (const index in multipleMenus) {
      const menu = multipleMenus[index];
      if (!notEmptyObject(menu)) {
        return true;
      }
    }
    return false;
  }

  function getMenu() {
    if (Array.isArray(id) && id.length > 1) {
      let multipleMenus = [];

      id.forEach((menuId) => {
        multipleMenus.push(handleSingleMenuId(menuId, true));
      });

      const isDifferentMenusMeta =
        new Set(multipleMenus.map((menu) => menu.meta)).size !== 1;
      let meta = multipleMenus[0].meta;
      if (isDifferentMenusMeta) {
        console.warn("meta is different for multiple menus");
      }
      const isEmpty = isOneMenuEmpty(multipleMenus);
      if (isEmpty) {
        return {};
      }
      const elements = multipleMenus
        .map((menu) => menu.elements)
        .reduce((accumulator, mEls) => accumulator.concat(mEls), []);
      const newMenuData = {
        id: multipleMenus.map((menu) => menu.id).join("/"),
        elements,
        meta,
        defaultElement: "",
      };
      return newMenuData;
    } else return handleSingleMenuId(Array.isArray(id) ? id[0] : id);
  }

  return getMenu();
}
