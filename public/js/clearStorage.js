function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = 'N032195';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
    }
}

// Remove all saved data from sessionStorage
if (storageAvailable)
    sessionStorage.clear();