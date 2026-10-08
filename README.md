# Weather Afghanistan

A responsive weather application centered on all 34 Afghan provinces, with worldwide place search. It uses plain HTML, CSS, and browser JavaScript. Open-Meteo provides the forecast and geocoding data; no API key is needed for the normal API use shown here.

## Features

- Kabul is the first-run default; a user's later location choice is remembered.
- Search or browse all 34 provinces and view their capital weather. Province forecasts load progressively, with at most two requests running from the province browser at once.
- Worldwide geocoding, keyboard-operable results, and optional browser location using its coordinates.
- Current conditions, 24 hours of hourly values, seven local days, sunrise/sunset, and available observation details.
- English and Afghan Dari, including RTL layout and localized condition descriptions.
- System, light, and dark appearance; condition-based weather atmosphere; reduced-motion support.
- Short-lived observation caching and offline stale-data fallback.
- Manifest and local SVG app icon for PWA preparation.

## Structure

```text
weather-afghanistan/
├── index.html
├── css/style.css
├── js/config.js
├── js/provinces.js
├── js/weather.js
├── js/search.js
├── js/ui.js
├── js/app.js
├── assets/icons/ (local SVG weather and app icons)
├── privacy-policy.html
├── terms.html
├── cookie-policy.html
├── data-use.html
├── security.md
├── auth.md
├── datasecurity.md
├── threat model.md
├── .htaccess (Apache deployment rules)
├── robots.txt
├── 404.html (Apache custom error page)
├── manifest.json
├── .gitignore
└── README.md
```

## Run locally

Serve the folder over HTTP, for example with `python -m http.server 8000`, then open `http://localhost:8000`. Browser geolocation requires HTTPS or localhost. This site has no build step or package dependencies.

## Open-Meteo integration

Forecast and Geocoding endpoints are centralized in `js/config.js`. `js/weather.js` requests current, hourly, and daily fields, validates the response, normalizes it to the app's internal structure, maps WMO weather codes, and deduplicates concurrent coordinate requests. The UI only consumes the normalized structure. To replace the provider, implement its response mapping in the adapter while retaining the same normalized fields.

`js/search.js` handles geocoding. The search input is debounced at 400 ms, validates returned names and coordinate ranges, and limits the displayed choices to eight. The standard Open-Meteo Geocoding API provides forward search; location permission still displays weather by coordinates, but does not claim a reverse-geocoded city name.

Open-Meteo usage remains subject to its current terms, fair-use limits, and attribution requirements. This app attributes the source in its footer. Review the provider's latest terms before public or high-volume deployment.

If a future provider requires a secret API key, do not place that credential in frontend JavaScript. Use a backend or serverless proxy. Even though this implementation does not need a key, frontend requests and responses are visible to users.

## Provinces

`js/provinces.js` contains permanent English and Dari names and provincial-capital coordinates for Kabul, Kapisa, Parwan, Wardak, Logar, Ghazni, Paktia, Paktika, Khost, Nangarhar, Laghman, Panjshir, Baghlan, Bamyan, Samangan, Balkh, Jawzjan, Sar-e Pol, Faryab, Badghis, Herat, Ghor, Daykundi, Uruzgan, Kandahar, Zabul, Helmand, Nimroz, Farah, Takhar, Kunduz, Badakhshan, Nuristan, and Kunar. The province browser uses an intersection observer and a two-request queue; it does not launch 34 simultaneous requests.

An accurate province-boundary vector map is not bundled. The map-ready section explains this rather than drawing invented province boundaries.

## Languages and weather visuals

All user-facing copy is defined in `I18N` in `js/ui.js`. The language switch changes the document `lang` and `dir` attributes, localizes weather code descriptions, and persists the selected language. Weather icons are local SVG image assets, so the app needs no external icon font or icon service. Browser native font fallbacks are used without external font requests.

`getWeatherCondition(code, isNight)` maps WMO codes to the internal condition set. Sunrise and sunset determine current day/night when available. CSS themes and small, bounded particle sets provide condition-based atmosphere. Decorative effects have `pointer-events: none`; particle creation is skipped when reduced motion is requested.

## Caching, location, and privacy

Weather observations are cached for ten minutes in local storage and expire for normal reuse. A saved result can be shown as stale for at most 24 hours, and the cache is limited to 50 valid weather entries. API requests time out after 12 seconds. If a request fails, the app may show an older saved observation with a stale-data notice. The selected location and language/theme preferences are also saved. No credentials, analytics, or third-party scripts are stored or loaded. Browser geolocation is requested only after the user activates “Use my location.”

The Content Security Policy restricts scripts to the same origin and network access to the two Open-Meteo hosts. Its style policy permits inline style declarations because the bounded decorative particles receive generated CSS position and timing values; those values are random numbers, never provider or user strings.

## PWA and deployment

`manifest.json` and a local SVG icon prepare the app for installation. No service worker is registered, so live weather is never cached indefinitely by a service worker. Deploy the files to a static HTTPS host. If you change API hosts, update the Content Security Policy `connect-src` in `index.html` to match.

The included `.htaccess` is for Apache: it disables directory listings, redirects HTTP to HTTPS, adds browser security headers, rejects methods other than GET/HEAD, and blocks standalone `.xml` paths while allowing the local SVG icons. Apache must permit the required `.htaccess` overrides (`Options`, `FileInfo`, and `Limit`), or rules may be ignored or cause a server error. A valid TLS certificate must be installed first; configure the real `ServerName` and `UseCanonicalName On` in the Apache virtual host so HTTPS redirection cannot reflect a forged Host header. For Netlify, Cloudflare Pages, GitHub Pages, Nginx, or another host, configure equivalent HTTPS redirects, response headers, method restrictions, and XML path blocks in that host; `.htaccess` is not enforced by non-Apache servers. Browser-side code cannot force secure transport before a request reaches the server.

`robots.txt` permits crawling of the public website while excluding standalone XML files other than a future `sitemap.xml`. A sitemap needs the final public HTTPS domain so every `<loc>` is an absolute URL; add it after the deployment domain is known. Apache serves `404.html` for missing paths via `ErrorDocument`; configure the equivalent custom 404 page in other hosting platforms.

## Policies and security documents

Visitor-facing pages: [Privacy Policy](privacy-policy.html), [Terms](terms.html), [Cookie Policy](cookie-policy.html), and [Data Use](data-use.html). Technical notes: [Security](security.md), [Authentication](auth.md), [Data Security](datasecurity.md), and [Threat Model](threat%20model.md).

This app has no account system, file upload feature, XML parser, third-party embedded content, analytics, or advertising. It uses local storage for preferences and a short-lived weather cache; search text and requested coordinates are sent directly to Open-Meteo. Provider and hosting logs are subject to their respective policies. See the policy pages for details. Add an appropriate contact and jurisdiction-specific review before public commercial deployment.

## Limitations

- Open-Meteo forecast coverage, values, availability, and request policies are controlled by the upstream service.
- Province capital coordinates are point locations, not province averages.
- UV index is daily, so the current details panel shows today's daily maximum.
- No official province-boundary geometry is included; the interface does not pretend otherwise.
