const WEATHER_CONFIG = Object.freeze({
  WEATHER_BASE_URL: "https://api.open-meteo.com/v1/forecast",
  GEOCODING_BASE_URL: "https://geocoding-api.open-meteo.com/v1/search",
  FORECAST_DAYS: 7,
  HOURLY_HOURS: 24,
  CACHE_DURATION: 10 * 60 * 1000,
  CACHE_MAX_STALE: 24 * 60 * 60 * 1000,
  CACHE_MAX_ENTRIES: 50,
  SEARCH_DEBOUNCE: 400,
  REQUEST_TIMEOUT: 12000,
});
