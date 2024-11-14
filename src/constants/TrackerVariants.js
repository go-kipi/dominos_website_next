import { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM, DELIVERY_TYPES } from "./TrackerOrderEnum";
import FutureOrderAnim from 'animations/tracker/future-order-clock.json';
import DeliveryReadyPoi from 'animations/tracker/delivery-ready-poi.json';
import DeliveryReadyApt from 'animations/tracker/delivery-ready-apt.json';
import DeliveryReadyOffice from 'animations/tracker/delivery-ready-office.json';
import DeliveryReadyHome from 'animations/tracker/delivery-ready-home.json';
import PickupReady from 'animations/tracker/pickup-ready.json';

export const VARIANTS = {
    [ORDER_STATUS_ENUM.FUTURE]: {
        [ORDER_TYPE_ENUM.DELIVERY]: {
            PRE_TRACKING_ANIM: FutureOrderAnim,
            PRE_TRACKING_TITLE: 'trackerScreen_preTracking_delivery_title',
            PRE_TRACKING_SUBTITLE: 'trackerScreen_preTracking_delivery_subtitle',
        },
        [ORDER_TYPE_ENUM.PICK_UP]: {
            PRE_TRACKING_ANIM: FutureOrderAnim,
            PRE_TRACKING_TITLE: 'trackerScreen_preTracking_pickup_title',
            PRE_TRACKING_SUBTITLE: 'trackerScreen_preTracking_pickup_subtitle',
        }
    }
}

export const POST_TRACKING_VARIANTS = {
    [ORDER_TYPE_ENUM.DELIVERY]: {
        [DELIVERY_TYPES.POI]: {
            POST_TRACKING_ANIM: DeliveryReadyPoi,
        },
        [DELIVERY_TYPES.APT]: {
            POST_TRACKING_ANIM: DeliveryReadyApt,
        },
        [DELIVERY_TYPES.HOME]: {
            POST_TRACKING_ANIM: DeliveryReadyHome,
        },
        [DELIVERY_TYPES.OFFICE]: {
            POST_TRACKING_ANIM: DeliveryReadyOffice,
        }
    },
    [ORDER_TYPE_ENUM.PICK_UP]: {
        POST_TRACKING_ANIM: PickupReady,
    }
}