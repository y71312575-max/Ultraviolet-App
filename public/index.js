"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

const wispUrl = "wss://wisp.mercurywork.shop/";

async function initProxy() {
	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	await initProxy();

	const url = search(address.value, searchEngine.value);
	let frame = document.getElementById("uv-frame");
	frame.style.display = "block";
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

// Auto-load ?url= passed from ProxyFox's address bar
window.addEventListener("DOMContentLoaded", async () => {
	const params = new URLSearchParams(window.location.search);
	const autoUrl = params.get("url");
	if (!autoUrl) return;

	await initProxy();
	const url = search(autoUrl, searchEngine.value);
	window.location.replace(__uv$config.prefix + __uv$config.encodeUrl(url));
});
