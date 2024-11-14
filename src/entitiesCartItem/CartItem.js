class CartItem {
  _productId;
  _quantity;
  _subitems;
  _quarters;
  _triggerProductId;
  _uuid;
  _benefitId;
  _couponId;

  constructor(
    productId,
    quantity = 1,
    subitems = [],
    quarters = null,
    triggerProductId = null,
    uuid = null,
    benefitId = null,
    couponId = null
  ) {
    this.setProductId(productId);
    this.setQuarters(quarters);
    this.setQuantity(quantity);
    this.setSubItems(subitems);
    this.setTriggerProductId(triggerProductId);
    this.setUUID(uuid);
    this.setBenefitId(benefitId);
    this.setCouponId(couponId);
  }

  setTriggerProductId(triggerProductId) {
    this._triggerProductId = triggerProductId;
  }

  setSubItems(subitems) {
    let subitemsArr = [];
    if (Array.isArray(subitems) && subitems.length > 0) {
      subitems.forEach((si) => {
        if (!(si instanceof CartItem)) {
          const item = new CartItem(
            si.productId,
            si.quantity,
            si?.subitems,
            si?.quarters,
            si?.triggerProductId,
            si?.uuid,
            si?.benefitId
          );
          subitemsArr.push(item);
        } else {
          subitemsArr.push(si);
        }
      });
    }
    this._subitems = subitemsArr;
  }

  setSubItem(product, index) {
    const subItems = [...this._subitems];
    subItems[index] = product;
    this._subitems = subItems;
  }

  setQuarters(quarters) {
    this._quarters = quarters;
  }

  setProductId(productId) {
    this._productId = productId;
  }

  setQuantity(quantity) {
    this._quantity = quantity;
  }

  setUUID(uuid) {
    this._uuid = uuid;
  }

  setBenefitId(benefitId) {
    this._benefitId = benefitId;
  }
  setCouponId(couponId) {
    this._couponId = couponId;
  }

  /**
   *
   * @param {CartItem} product
   * has to be a CartItem object or the parseJson method wont work.
   */
  pushSubItem(product) {
    this._subitems.push(product);
  }

  pushAtIndex(product, index) {
    this._subitems[index] = product;
  }

  removeSubItem(subItemId) {
    this._subitems = this._subitems.filter(
      (subitem) => subitem.getProductId() !== subItemId
    );
  }

  isSubItemExists(subItemId) {
    const subItem = this._subitems.filter(
      (sub) => sub.getProductId() === subItemId
    );
    return subItem.length === 1;
  }

  isTopping() {
    return Array.isArray(this._quarters);
  }

  getTriggerProductId() {
    return this._triggerProductId;
  }

  getQuantity() {
    return this._quantity;
  }

  getSubItems() {
    return this._subitems;
  }

  getSubItem(index) {
    return this._subitems[index];
  }

  getProductId() {
    return this._productId;
  }

  getQuarters() {
    return this._quarters;
  }

  getUUID() {
    return this._uuid;
  }

  getUpsales() {
    return null;
  }

  parseJson() {
    return {
      uuid: this._uuid,
      productId: this._productId,
      quantity: this._quantity,
      quarters: this._quarters,
      subitems: Array.isArray(this._subitems)
        ? this._subitems.map((sub) => {
            if (sub instanceof CartItem) {
              return sub?.parseJson();
            }
            return null;
          })
        : null,
      triggerProductId: this._triggerProductId,
      benefitId: this._benefitId,
      couponId: this._couponId,
    };
  }

  replaceFather() {
    const newFather = new CartItem(
      this._productId,
      this._quantity,
      this._subitems,
      this._quarters,
      this._triggerProductId,
      this._uuid,
      this._benefitId,
      this._couponId
    );

    return newFather;
  }

  getChild(childId) {
    if (this._subitems.length === 0) {
      return;
    }
    const child = this._subitems.filter(
      (child) => child.getProductId() === childId
    );
    if (child.length === 1) {
      return child[0];
    }
    this._subitems.forEach((subitem) => {
      const res = subitem.getChild(childId);
      if (res) {
        return res;
      }
    });
  }

  changeProductId(productId) {
    this._productId = productId;
    this._quarters = null;
    this._subitems = [];
  }
}

export default CartItem;
