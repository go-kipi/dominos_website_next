import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import useGetMenuData from "./useGetMenuData";
import {notEmptyObject} from "utils/functions";

export default function useGetMenuByMeta(meta) {
    const menuPath = useSelector((store) => store.menuPath);
    const [whoCalledMe, setWhoCalledMe] = useState("");
    const menu = useGetMenuData({id: menuPath[whoCalledMe]});
    const hasElements = menu && notEmptyObject(menu);
    const indexOfMeta = menuPath.selected.indexOf(meta);

    useEffect(() => {
        if (indexOfMeta > 0) {
            const calledMeta = menuPath.selected[indexOfMeta - 1];
            setWhoCalledMe(calledMeta);
        }
    }, [indexOfMeta]);
    if (hasElements && menu.meta === meta) {
        // returning the right menu
        return menu;
    } else {
        return undefined;
    }
}
