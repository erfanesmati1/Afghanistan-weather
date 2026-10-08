# Authentication and authorization

This product currently has no user accounts, login, passwords, sessions, roles, or authorization model. It is a static weather website. Users can access the same public interface without signing in.

Browser geolocation is a separate browser permission. It is requested only after the user selects “Use my location”; the app does not treat that permission as account authentication or send coordinates until it requests weather.

There is no authentication endpoint or credential storage. If accounts or private data are added later, authentication must be implemented on a trusted backend with secure session handling, authorization checks on every protected operation, CSRF defenses where applicable, rate limiting, and a documented account recovery process. Never implement secret-bearing authentication solely in client-side JavaScript.
