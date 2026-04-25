import * as Sentry from "@sentry/react-router";
Sentry.init({
  dsn: "https://7d1aabaeeef8e5db7ff40ec4388aee0f@o4511222548725760.ingest.de.sentry.io/4511222557114448",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  tracesSampleRate:1.0,
  profilesSampleRate:1.0,
});