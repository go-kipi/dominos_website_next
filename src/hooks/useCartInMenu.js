import { TRIGGER } from "constants/trigger-enum";
import { useSelector } from "react-redux";
import CartService from "services/CartService";
export default function useCartInMenu(id) {
  const currentProductsCounter = useSelector(
    (store) => store.currentProductsCounter
  );
  const cart = useSelector((store) => store.cartData);
  const currentQuantity = currentProductsCounter[id]
    ? currentProductsCounter[id]
    : 0;

  function addToBasket(quantity, onValidateCallback, onAddToCartCallback, optionalPayload = null, onRejection) {
    const initialPayload = {item: {productId: id, quantity: quantity, triggeredBy: TRIGGER.MENU}};
    if (optionalPayload && typeof optionalPayload === 'object') {
      CartService.addToCart(
        optionalPayload,
        onValidateCallbackHandler,
        onAddToCartCallbackHandler,
        true,
        TRIGGER.MENU
      );
    }
    else {
      CartService.optimisticAddToCart(
        initialPayload,
        onAddToCartCallbackHandler,
        onRejection
      );
    }

    function onValidateCallbackHandler(data) {
      typeof onValidateCallback === "function" && onValidateCallback(data);
    }
    function onAddToCartCallbackHandler(currentCart) {
      typeof onAddToCartCallback === "function" &&
        onAddToCartCallback(currentCart);
    }
  }
  
  function removeFromBasket(decrementBy, onRemoveFromCartCallback, rejectionCallback) {
    if (!decrementBy) {
      return;
    }
    const isOptimistic = typeof rejectionCallback === 'function';
    const item = getLastItemFromCartById(id);
    const uuid = item ? item.uuid : undefined;
    const quantity = item ? item.quantity : undefined;
    if (uuid && quantity) {
      if (isOptimistic) {
        CartService.optimisticDeleteBasketItem(uuid, onDeleteBasketItemCallback, rejectionCallback);
      }
      else {
        CartService.deleteBasketItem(uuid, onDeleteBasketItemCallback);
        removeFromBasket(decrementBy - quantity);
      }
    }
    function onDeleteBasketItemCallback(currentCart) {
      typeof onRemoveFromCartCallback === "function" &&
        onRemoveFromCartCallback(currentCart);
    }
  }

  function getLastItemFromCartById(id) {
    if (cart?.items) {
      for (let i = cart.items.length - 1; i >= 0; i--) {
        const item = cart.items[i];
        if (item.productId === id) {
          return item;
        }
      }
    }
    return undefined;
  }

  return [currentQuantity, addToBasket, removeFromBasket];
}
