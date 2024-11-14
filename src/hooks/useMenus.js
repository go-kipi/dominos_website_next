import ActionTypes from "constants/menus-action-types";
import { useSelector } from "react-redux";

export default function useMenus(id, actionType) {
  const catalog = useSelector((store) => store.menusData.catalogProducts);
  const savedKits = useSelector((store) => store.menusData.savedKits);
  const recommendedKits = useSelector((store) => store.menusData.recommendedKits);
  let item;
  if (actionType === ActionTypes.RECOMMENDEDKIT) {
    item = recommendedKits ? recommendedKits[id] : {};
  } else if (actionType === ActionTypes.SAVEDKIT) {
    item = savedKits ? savedKits[id] : {};
  } else if (actionType === ActionTypes.PRODUCT) {
    item = catalog ? catalog[id] : {};
  }
  return item || {};
}
