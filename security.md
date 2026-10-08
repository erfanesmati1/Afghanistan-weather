# Security overview

This is a static browser application. It has no application server, account system, upload handler, or database. Client-side controls reduce accidental exposure and browser attack surface; they cannot make a public website immune to a malicious visitor or replace host-level controls.

## Transport and response headers

The supplied `.htaccess` is for Apache HTTP Server. It disables directory listings, redirects HTTP to HTTPS, and sets HSTS, CSP, and other browser security headers. The hosting configuration must allow the relevant `.htaccess` overrides (`Options`, `FileInfo`, and `Limit`); otherwise Apache may return a server error or ignore some protections. Deploy behind a valid TLS certificate. Before enabling its redirect, set the real `ServerName` and `UseCanonicalName On` in the Apache virtual host; the rule uses the canonical server name instead of reflecting the request's Host header. On another host, configure equivalent HTTPS redirects and response headers in that host's dashboard or web-server configuration. The CSP meta policy in `index.html` is a fallback; `frame-ancestors` and HSTS require HTTP response headers.

The policy allows same-origin scripts/styles/assets and HTTPS connections only to Open-Meteo forecast and geocoding endpoints. Inline style attributes are currently allowed for generated decorative particle positioning. Do not add third-party scripts, embeds, or endpoints without reviewing the policy.

## Uploads, methods, and XML

The app has no upload form or file-processing code. Apache configuration accepts only `GET` and `HEAD`, rejects write and other request methods, disables directory listings, and denies hidden repository/environment paths. It also rejects requests for standalone `.xml` files. SVG icons are intentionally retained; browsers treat SVG as an image asset under the restrictive CSP. Do not add XML parsing or file uploads without a separate security review and server-side validation.

Static hosts that do not support `.htaccess` must apply equivalent method and path restrictions at the edge/server. A frontend cannot enforce server request methods by itself.

## Data and dependencies

No authentication, passwords, analytics, trackers, or third-party embedded content are present. The app stores language, theme, selected place, and short-lived weather data in local storage. Search terms and coordinates are sent to Open-Meteo over HTTPS when the user searches or loads weather. See [Privacy Policy](privacy-policy.html), [Data Use](data-use.html), and [Cookie Policy](cookie-policy.html).

Weather and geocoding values are treated as untrusted input, validated, and inserted as text or fixed local asset paths. No `eval`, `new Function`, or inline event handlers are used. There is no secret API credential in this frontend.

## Reporting

Before public deployment, add a monitored security contact to this page. Do not publish private user or security reports in a public issue tracker.
