const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

export const ELYSIUM_BASE44_APP_ID = "6a2ae3a92ace0dad0f92f1a6";
export const ELYSIUM_BASE44_APP_BASE_URL = "https://elysium-nexus-flow.base44.app";
const ELYSIUM_BASE44_APP_ORIGIN = new URL(ELYSIUM_BASE44_APP_BASE_URL).origin;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const isUsableParamValue = (value) => {
	return Boolean(value && value !== "null" && value !== "undefined");
}

const isCanonicalAppUrl = (value) => {
	try {
		return new URL(value).origin === ELYSIUM_BASE44_APP_ORIGIN;
	} catch {
		return false;
	}
}

const normalizeAppId = (value) => value === ELYSIUM_BASE44_APP_ID ? value : null;

const normalizeAppBaseUrl = (value) => {
	if (!isCanonicalAppUrl(value)) return null;
	return new URL(value).origin;
}

export const buildCanonicalAppUrl = (value = "/") => {
	if (isNode) {
		return new URL(value, ELYSIUM_BASE44_APP_BASE_URL).toString();
	}
	try {
		const candidate = new URL(value, window.location.origin);
		if (candidate.origin === ELYSIUM_BASE44_APP_ORIGIN) {
			return candidate.toString();
		}
		if (value.startsWith("/")) {
			return new URL(value, ELYSIUM_BASE44_APP_BASE_URL).toString();
		}
	} catch {
		// Fall through to the canonical app home.
	}
	return ELYSIUM_BASE44_APP_BASE_URL;
}

export const getCurrentCanonicalAppUrl = () => {
	if (isNode) return ELYSIUM_BASE44_APP_BASE_URL;
	return buildCanonicalAppUrl(window.location.href);
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false, normalizeValue = (value) => value } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (isUsableParamValue(searchParam)) {
		const normalizedSearchParam = normalizeValue(searchParam);
		if (isUsableParamValue(normalizedSearchParam)) {
			storage.setItem(storageKey, normalizedSearchParam);
			return normalizedSearchParam;
		}
		storage.removeItem(storageKey);
	}
	if (isUsableParamValue(defaultValue)) {
		const normalizedDefaultValue = normalizeValue(defaultValue);
		if (isUsableParamValue(normalizedDefaultValue)) {
			storage.setItem(storageKey, normalizedDefaultValue);
			return normalizedDefaultValue;
		}
	}
	const storedValue = storage.getItem(storageKey);
	if (isUsableParamValue(storedValue)) {
		const normalizedStoredValue = normalizeValue(storedValue);
		if (isUsableParamValue(normalizedStoredValue)) {
			return normalizedStoredValue;
		}
		storage.removeItem(storageKey);
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID || ELYSIUM_BASE44_APP_ID, normalizeValue: normalizeAppId }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: getCurrentCanonicalAppUrl(), normalizeValue: buildCanonicalAppUrl }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || ELYSIUM_BASE44_APP_BASE_URL, normalizeValue: normalizeAppBaseUrl }),
	}
}


export const appParams = {
	...getAppParams()
}
