const pendingRequests = new Map();
const WEATHER_CODES = Object.freeze({
  0: { condition: "clear", en: "Clear sky", fa: "آسمان صاف" }, 1: { condition: "clear", en: "Mainly clear", fa: "عمدتاً صاف" }, 2: { condition: "partly-cloudy", en: "Partly cloudy", fa: "قسمتی ابری" }, 3: { condition: "cloudy", en: "Overcast", fa: "ابری" },
  45: { condition: "fog", en: "Fog", fa: "مه" }, 48: { condition: "fog", en: "Depositing rime fog", fa: "مه یخ‌زن" }, 51: { condition: "drizzle", en: "Light drizzle", fa: "نم‌نم باران" }, 53: { condition: "drizzle", en: "Drizzle", fa: "باران نم‌نم" }, 55: { condition: "drizzle", en: "Dense drizzle", fa: "نم‌نم باران شدید" }, 56: { condition: "drizzle", en: "Freezing drizzle", fa: "باران یخ‌زن" }, 57: { condition: "drizzle", en: "Heavy freezing drizzle", fa: "باران یخ‌زن شدید" },
  61: { condition: "rain", en: "Light rain", fa: "باران سبک" }, 63: { condition: "rain", en: "Rain", fa: "بارانی" }, 65: { condition: "heavy-rain", en: "Heavy rain", fa: "باران شدید" }, 66: { condition: "rain", en: "Freezing rain", fa: "باران یخ‌زن" }, 67: { condition: "heavy-rain", en: "Heavy freezing rain", fa: "باران یخ‌زن شدید" }, 71: { condition: "snow", en: "Light snow", fa: "برف سبک" }, 73: { condition: "snow", en: "Snow", fa: "برفی" }, 75: { condition: "snow", en: "Heavy snow", fa: "برف شدید" }, 77: { condition: "snow", en: "Snow grains", fa: "دانه‌های برف" },
  80: { condition: "rain", en: "Rain showers", fa: "رگبار باران" }, 81: { condition: "rain", en: "Rain showers", fa: "رگبار باران" }, 82: { condition: "heavy-rain", en: "Violent rain showers", fa: "رگبار شدید باران" }, 85: { condition: "snow", en: "Snow showers", fa: "رگبار برف" }, 86: { condition: "snow", en: "Heavy snow showers", fa: "رگبار شدید برف" }, 95: { condition: "thunderstorm", en: "Thunderstorm", fa: "رعد و برق" }, 96: { condition: "thunderstorm", en: "Thunderstorm with hail", fa: "رعد و برق همراه تگرگ" }, 99: { condition: "thunderstorm", en: "Severe thunderstorm with hail", fa: "رعد و برق شدید همراه تگرگ" }
});
function getWeatherCondition(code, isNight = false) { const mapped = typeof code === "number" && Number.isFinite(code) ? WEATHER_CODES[code]?.condition || "unknown" : "unknown"; if (!isNight) return mapped; if (mapped === "clear") return "clear-night"; if (mapped === "partly-cloudy") return "partly-cloudy-night"; return mapped; }
function getWeatherDescription(code, language = "en") { const item = typeof code === "number" && Number.isFinite(code) ? WEATHER_CODES[code] : null; return item ? item[language === "fa" ? "fa" : "en"] : (language === "fa" ? "وضعیت نامشخص" : "Conditions unavailable"); }
function validCoordinates(latitude, longitude) { return typeof latitude === "number" && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && typeof longitude === "number" && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180; }
function cacheKey(lat, lon) { return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`; }
function validLocalDateTime(value) { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value) && Number.isFinite(Date.parse(value)); }
function validTimezone(value) { if (typeof value !== "string" || !value || value.length > 64) return false; try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }
function nullableInRange(value, min, max) { return value === null || (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max); }
function validWeatherCode(value) { return value === null || (Number.isInteger(value) && value >= 0 && value <= 99); }
function validNormalizedWeather(data) {
  if (!data || typeof data !== "object" || !validCoordinates(data.latitude, data.longitude) || !validTimezone(data.timezone)) return false;
  const current = data.current;
  if (!current || typeof current !== "object" || typeof current.temperature !== "number" || !nullableInRange(current.temperature, -100, 70) || !validLocalDateTime(current.time) || typeof current.isDay !== "boolean") return false;
  if (!nullableInRange(current.feelsLike, -120, 100) || !nullableInRange(current.humidity, 0, 100) || !nullableInRange(current.pressure, 0, 2000) || !nullableInRange(current.windSpeed, 0, 500) || !nullableInRange(current.windDirection, 0, 360) || !nullableInRange(current.visibility, 0, 1000000) || !nullableInRange(current.cloudCover, 0, 100) || !validWeatherCode(current.weatherCode)) return false;
  if (!Array.isArray(data.hourly) || !data.hourly.length || data.hourly.length > WEATHER_CONFIG.HOURLY_HOURS || !Array.isArray(data.daily) || !data.daily.length || data.daily.length > WEATHER_CONFIG.FORECAST_DAYS) return false;
  return data.hourly.every(item => item && validLocalDateTime(item.time) && nullableInRange(item.temperature, -100, 70) && validWeatherCode(item.weatherCode) && nullableInRange(item.humidity, 0, 100) && nullableInRange(item.windSpeed, 0, 500)) && data.daily.every(item => item && typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Date.parse(`${item.date}T12:00:00Z`)) && validWeatherCode(item.weatherCode) && nullableInRange(item.high, -100, 70) && nullableInRange(item.low, -100, 70) && nullableInRange(item.uvIndex, 0, 50) && (item.sunrise === null || validLocalDateTime(item.sunrise)) && (item.sunset === null || validLocalDateTime(item.sunset)));
}
function readWeatherCache(lat, lon) {
  try {
    const item = JSON.parse(localStorage.getItem(`weather:${cacheKey(lat, lon)}`) || "null");
    const age = item && Number.isFinite(item.timestamp) ? Date.now() - item.timestamp : Infinity;
    if (item && age >= 0 && validNormalizedWeather(item.data)) return { ...item, age };
  } catch { }
  return null;
}
function getCachedWeather(lat, lon) { const item = readWeatherCache(lat, lon); return item && item.age < WEATHER_CONFIG.CACHE_DURATION ? { data: item.data, stale: false } : null; }
function getAnyStoredWeather(lat, lon) { const item = readWeatherCache(lat, lon); return item && item.age <= WEATHER_CONFIG.CACHE_MAX_STALE ? { data: item.data, stale: item.age >= WEATHER_CONFIG.CACHE_DURATION } : null; }
function pruneWeatherCache(keepKey) {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(key => key?.startsWith("weather:"));
    const entries = [];
    for (const key of keys) {
      if (key === keepKey) continue;
      try {
        const item = JSON.parse(localStorage.getItem(key) || "null");
        const age = item && Number.isFinite(item.timestamp) ? Date.now() - item.timestamp : Infinity;
        if (age < 0 || age >= WEATHER_CONFIG.CACHE_MAX_STALE || !validNormalizedWeather(item?.data)) localStorage.removeItem(key);
        else entries.push({ key, timestamp: item.timestamp });
      } catch { localStorage.removeItem(key); }
    }
    entries.sort((a, b) => a.timestamp - b.timestamp);
    while (entries.length >= WEATHER_CONFIG.CACHE_MAX_ENTRIES) localStorage.removeItem(entries.shift().key);
  } catch { }
}
function setCachedWeather(data) {
  const key = `weather:${cacheKey(data.latitude, data.longitude)}`;
  try { pruneWeatherCache(key); localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data })); }
  catch { try { pruneWeatherCache(key); localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data })); } catch { } }
}
async function getWeather(latitude, longitude) {
  const lat = latitude, lon = longitude; if (!validCoordinates(lat, lon)) throw Object.assign(new Error("Invalid coordinates"), { code: "INVALID_LOCATION" });
  const key = cacheKey(lat, lon); const cached = getCachedWeather(lat, lon); if (cached) return cached.data; if (pendingRequests.has(key)) return pendingRequests.get(key);
  const request = (async () => {
    const url = new URL(WEATHER_CONFIG.WEATHER_BASE_URL); Object.entries({ latitude: lat, longitude: lon, current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,cloud_cover", hourly: "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m", daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max", forecast_days: WEATHER_CONFIG.FORECAST_DAYS, timezone: "auto", wind_speed_unit: "kmh", temperature_unit: "celsius" }).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), WEATHER_CONFIG.REQUEST_TIMEOUT);
    try { const response = await fetch(url, { headers: { Accept: "application/json" }, credentials: "omit", signal: controller.signal }); if (response.status === 429) throw Object.assign(new Error("Rate limited"), { code: "RATE_LIMIT" }); if (!response.ok) throw Object.assign(new Error("Weather request failed"), { code: "API_ERROR" }); let raw; try { raw = await response.json(); } catch { throw Object.assign(new Error("Invalid weather response"), { code: "INVALID_RESPONSE" }); } return normalizeOpenMeteo(raw, lat, lon); } catch (error) { if (error?.name === "AbortError") throw Object.assign(new Error("Weather request timed out"), { code: "TIMEOUT" }); if (error?.name === "TypeError") throw Object.assign(new Error("Network request failed"), { code: "NETWORK" }); throw error; } finally { clearTimeout(timeout); }
  })(); pendingRequests.set(key, request); try { return await request; } finally { pendingRequests.delete(key); }
}
function normalizeOpenMeteo(raw, latitude, longitude) {
  if (!raw || typeof raw !== "object" || !raw.current || !raw.hourly || !raw.daily || !Number.isFinite(raw.current.temperature_2m) || !validLocalDateTime(raw.current.time) || ![0, 1].includes(raw.current.is_day) || !Array.isArray(raw.hourly.time) || !Array.isArray(raw.daily.time)) throw Object.assign(new Error("Invalid weather data"), { code: "INVALID_RESPONSE" });
  const c = raw.current, h = raw.hourly, d = raw.daily; const arr = (source, key, index) => Array.isArray(source[key]) ? source[key][index] ?? null : null;
  const hourly = []; const matchIndex=h.time.findIndex(time=>time>=String(c.time||"")); const startIndex=matchIndex<0?0:matchIndex; for (let i = startIndex; i < Math.min(h.time.length, startIndex + WEATHER_CONFIG.HOURLY_HOURS); i++)hourly.push({ time: h.time[i], temperature: arr(h, "temperature_2m", i), weatherCode: arr(h, "weather_code", i), humidity: arr(h, "relative_humidity_2m", i), windSpeed: arr(h, "wind_speed_10m", i) });
  const daily = []; for (let i = 0; i < Math.min(d.time.length, WEATHER_CONFIG.FORECAST_DAYS); i++)daily.push({ date: d.time[i], weatherCode: arr(d, "weather_code", i), high: arr(d, "temperature_2m_max", i), low: arr(d, "temperature_2m_min", i), sunrise: arr(d, "sunrise", i), sunset: arr(d, "sunset", i), uvIndex: arr(d, "uv_index_max", i) });
  if (!hourly.length || !daily.length) throw Object.assign(new Error("Incomplete weather data"), { code: "INVALID_RESPONSE" });
  const timezone = validTimezone(raw.timezone) ? raw.timezone : "UTC";
  const normalized = { latitude, longitude, timezone, timezoneAbbreviation: typeof raw.timezone_abbreviation === "string" ? raw.timezone_abbreviation.slice(0, 16) : "UTC", utcOffsetSeconds: Number.isFinite(raw.utc_offset_seconds) ? raw.utc_offset_seconds : 0, current: { temperature: c.temperature_2m, feelsLike: finiteOrNull(c.apparent_temperature), humidity: finiteOrNull(c.relative_humidity_2m), pressure: finiteOrNull(c.pressure_msl), windSpeed: finiteOrNull(c.wind_speed_10m), windDirection: finiteOrNull(c.wind_direction_10m), visibility: finiteOrNull(c.visibility), cloudCover: finiteOrNull(c.cloud_cover), weatherCode: finiteOrNull(c.weather_code), time: c.time, isDay: c.is_day === 1 }, hourly, daily }; if (!validNormalizedWeather(normalized)) throw Object.assign(new Error("Invalid normalized weather data"), { code: "INVALID_RESPONSE" }); setCachedWeather(normalized); return normalized;
}
function finiteOrNull(value) { return typeof value === "number" && Number.isFinite(value) ? value : null; }
function localIsNight(data) { const current = data.current; const today = data.daily.find(day => day.date === current.time.slice(0, 10)); if (today?.sunrise && today?.sunset) return current.time < today.sunrise || current.time >= today.sunset; return !current.isDay; }
