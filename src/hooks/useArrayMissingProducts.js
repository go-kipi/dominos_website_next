import { useSelector } from "react-redux";

export default function useArrayMissingProducts() {
  const catalogProducts = useSelector(
    (store) => store.menusData.catalogProducts
  );

  function getObjectProductCart(items) {
    let obj = {};
    for (const key in items) {
      const item = items[key];

      if (
        (catalogProducts && !(item.productId in catalogProducts)) ||
        !catalogProducts
      ) {
        // no item found
        obj[item.productId] = item.productId;
      }

      if (item.subItems) {
        const subItems = getObjectProductCart(item.subItems);
        obj = { ...subItems, ...obj };
      }
    }

    return obj;
  }

  function getArrayProductCart(cuurentCart) {
    const obj = getObjectProductCart(cuurentCart);
    const array = Object.keys(obj);
    return array;
  }

  return getArrayProductCart;
}
