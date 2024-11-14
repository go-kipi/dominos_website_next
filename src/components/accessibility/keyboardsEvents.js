import {
    KEY_ARROW_DOWN,
    KEY_ARROW_LEFT,
    KEY_ARROW_RIGHT,
    KEY_ARROW_UP,
    KEY_ENTER,
    KEY_ESC,
    KEY_SPACE,
    KEY_TAB,
} from "constants/accessibility-types";

export function handleKeyPress(event, callback) {
    if (event.key === KEY_ENTER || event.code === KEY_SPACE) {
        typeof callback === 'function' && callback();
    }
}

export function handleArrows(event, callback) {
    let param
    switch (event.code) {
        case KEY_ARROW_UP:
            param = 'up'
            break;
        case KEY_ARROW_RIGHT:
            param = 'right'
            break;
        case KEY_ARROW_DOWN:
            param = 'down'
            break;
        case KEY_ARROW_LEFT:
            param = 'left'
            break;
        default:
            break;
    }
    if (event.code === KEY_ARROW_DOWN || event.code === KEY_ARROW_UP ||
        event.code === KEY_ARROW_LEFT || event.code === KEY_ARROW_RIGHT) {
        typeof callback === 'function' && callback(param)
    }
}

export function handleArrowLeftAndRight(event, callback) {
    event?.code && event.code.startsWith('Arrow') && event.preventDefault(); // So scrollbar wont move on arrow press
    const param = event.code === KEY_ARROW_LEFT ? 'left' : 'right'
    if (event.code === KEY_ARROW_LEFT ||
        event.key === KEY_ARROW_RIGHT) {
        typeof callback === 'function' && callback(param);
    }
}

export function handleArrowUpAndDown(event, callback) {
    event?.code && event.code.startsWith('Arrow') && event.preventDefault(); // So scrollbar wont move on arrow press
    const param = event.code === KEY_ARROW_UP ? 'up' : 'down'
    if (event.code === KEY_ARROW_UP ||
        event.key === KEY_ARROW_DOWN) {
        typeof callback === 'function' && callback(param);
    }
}

export function handleTabPress(event, callback) {
    if (event.key === KEY_TAB && !event.shiftKey) {
        typeof callback === 'function' && callback()
    }
}

export function handleTabBack(event, callback) {
    if (event.key === KEY_TAB && event.shiftKey) {
        typeof callback === 'function' && callback()
    }
}

export function handleEscClose(event, callback) {
    if (event.key === KEY_ESC) {
        typeof callback === 'function' && callback()
    }
}

export function handleEnterPress(event, callback) {
    if (event.key === KEY_ENTER) {
        typeof callback === 'function' && callback();
    }
}

export function handleTabDirection(event, callback) {
    let param
    const next = event.key === KEY_TAB && event.shiftKey
    const back = event.key === KEY_TAB && !event.shiftKey
    if (next) param = 'back'
    if (back) param = 'next'

    if (next || back) {
        typeof callback === 'function' && callback(param)
    }
}
