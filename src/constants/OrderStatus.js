const ORDER_STATUS = {
  BASKET: "basket",
  IN_MENU: "inmenu",
  NO_ORDER: "noorder",
  TRACKER: "tracker",
  IN_PAYMENT: "inpayment",
};

export const ALLOWED_MENU_STATUS = [
  ORDER_STATUS.BASKET,
  ORDER_STATUS.IN_MENU,
  ORDER_STATUS.TRACKER,
];

export const NO_ORDER_STATUS = [ORDER_STATUS.NO_ORDER];
export const TRACKER_STATUS = [ORDER_STATUS.TRACKER];

export default ORDER_STATUS;
