# Data security

## Data handled by this app

- Search text is sent to Open-Meteo Geocoding when a global search is submitted after debounce.
- Location coordinates are sent to Open-Meteo Forecast to retrieve weather. Coordinates come from a selected Afghan provincial capital, selected geocoding result, or browser geolocation after explicit user action.
- Selected location, language, theme, and weather responses are kept in browser local storage. Weather entries have an expiry timestamp; old fallback data is labeled stale.
- The static hosting provider may process standard connection metadata such as IP address and request logs under its own policy.

The app does not request names, email addresses, contacts, precise device identifiers, or payment information. It does not include analytics, advertising, third-party embeds, file upload, or an app-owned server/database. This is a code-level inventory, not a guarantee about the host or external providers.

## Protection and retention

Network calls use HTTPS. CSP limits scripts and API connections. Browser storage remains on the user's device until cleared or overwritten; it is not encrypted and must not be used for secrets. Weather cache entries expire after the configured ten-minute freshness period, though stale data can remain available as an explicitly labeled offline fallback until replaced or cleared.

Open-Meteo receives API request data directly from the browser. Review its current [privacy and terms](https://open-meteo.com/en/terms). Hosting and provider retention are governed by those organizations, not this application. To clear app data, remove this site's local storage/site data in the browser.

## Future changes

Before adding telemetry, accounts, uploads, or a backend, update this inventory and the privacy notice, minimize collected data, define retention/deletion rules, and review access controls and breach handling. Any secret provider credential belongs on a server or serverless proxy, never in frontend code.
