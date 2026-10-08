# Threat model

## Scope and assumptions

The application is a static client-side weather site. It calls Open-Meteo directly and stores a small amount of preference and weather data in local storage. Production security headers depend on the deployment host; `.htaccess` applies only to Apache. The user's device and browser are outside the application's control.

## Assets

- Integrity of the HTML, CSS, JavaScript, and local SVG assets.
- User search terms and optional location coordinates.
- Local preferences and cached observations.
- Availability and correct presentation of weather data.

## Threats and mitigations

| Threat | Mitigation | Remaining limit |
| --- | --- | --- |
| Malicious API or search text causes DOM XSS | Validate response shapes and coordinate ranges; render untrusted values as text; no dynamic executable code | Browser or same-origin hosting compromise can still replace app code |
| Network interception or downgrade | HTTPS redirect, HSTS, and HTTPS API endpoints when host headers are configured | Host must have a valid TLS certificate and correctly serve headers |
| Unexpected scripts, frames, or API destinations | CSP and no third-party scripts/embeds | CSP must be maintained when app endpoints change |
| Unauthorized upload or method abuse against this static app | No upload UI/handler; Apache allows only GET/HEAD and rejects standalone XML paths | Static-host controls must be configured separately; edge/CDN behavior may differ |
| Exposure through browser storage | Store only non-secret preferences and short-lived weather; user can clear site data | Local storage is readable by scripts running on the origin and is not encrypted |
| Location privacy | Geolocation only after explicit user action; coordinates sent only to fetch weather | Open-Meteo and the host process request metadata under their own terms |
| Service outage/rate limiting | Friendly errors, request deduplication, bounded progressive province loads, stale cache notice | Upstream availability and limits are outside app control |
| Motion effects impair access | Effects are decorative, pointer-transparent, bounded, and reduced for reduced-motion preference | Browser rendering varies across devices |

## Out of scope

There is no account system, private server-side record, payment flow, or upload pipeline to protect. Adding any of these changes the threat model and requires a fresh review, especially server-side authorization, validation, retention, and abuse controls.
