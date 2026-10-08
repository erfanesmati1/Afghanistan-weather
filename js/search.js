function debounce(callback, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => callback(...args), delay); }; }
function validateLocation(item) { return !!item && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 120 && typeof item.latitude === "number" && Number.isFinite(item.latitude) && item.latitude >= -90 && item.latitude <= 90 && typeof item.longitude === "number" && Number.isFinite(item.longitude) && item.longitude >= -180 && item.longitude <= 180 && typeof item.timezone === "string" && item.timezone.length <= 64; }
async function searchLocations(query, language = "en", externalSignal = null) {
  const clean = String(query || "").trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, 80); if ([...clean].filter(char => char.trim()).length < 2) return [];
  const url = new URL(WEATHER_CONFIG.GEOCODING_BASE_URL); url.searchParams.set("name", clean); url.searchParams.set("count", "8"); url.searchParams.set("language", language === "fa" ? "fa" : "en"); url.searchParams.set("format", "json");
  const controller = new AbortController(); const abortFromCaller = () => controller.abort(); if (externalSignal?.aborted) controller.abort(); else externalSignal?.addEventListener("abort", abortFromCaller, { once: true }); const timeout = setTimeout(() => controller.abort(), WEATHER_CONFIG.REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, credentials: "omit", signal: controller.signal });
    if (response.status === 429) throw Object.assign(new Error("Rate limited"), { code: "RATE_LIMIT" });
    if (!response.ok) throw Object.assign(new Error("Geocoding failed"), { code: "API_ERROR" });
    let payload; try { payload = await response.json(); } catch { throw Object.assign(new Error("Invalid geocoding response"), { code: "INVALID_RESPONSE" }); }
    if (!payload || typeof payload !== "object" || payload.error) throw Object.assign(new Error("Invalid geocoding response"), { code: "INVALID_RESPONSE" });
    if (payload.results === undefined) return [];
    if (!Array.isArray(payload.results)) throw Object.assign(new Error("Invalid geocoding response"), { code: "INVALID_RESPONSE" });
    return payload.results.slice(0, 8).filter(item => item && typeof item === "object").map(item => ({ name: boundedText(item.name, 120), country: boundedText(item.country, 100), region: boundedText(item.admin1, 100), latitude: item.latitude, longitude: item.longitude, timezone: validTimezone(item.timezone) ? item.timezone : "UTC" })).filter(validateLocation);
  } catch (error) {
    if (error?.name === "AbortError") throw Object.assign(new Error("Geocoding request timed out"), { code: "TIMEOUT" });
    if (error?.name === "TypeError") throw Object.assign(new Error("Geocoding network failure"), { code: "NETWORK" });
    throw error;
  } finally { clearTimeout(timeout); externalSignal?.removeEventListener("abort", abortFromCaller); }
}
function boundedText(value, maxLength) { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
