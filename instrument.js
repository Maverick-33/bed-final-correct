// // import * as Sentry from "@sentry/node";

// // // Ensure to call this before importing any other modules!
// // Sentry.init({
// //   dsn: "https://f7d6397304c1809ce3cf354669dbe4c2@o4508403423510528.ingest.de.sentry.io/4508403427901520",

// //   // Add Tracing by setting tracesSampleRate
// //   // We recommend adjusting this value in production
// //   tracesSampleRate: 1.0,
// // });
// import * as Sentry from "@sentry/node";
// import { nodeProfilingIntegration } from "@sentry/profiling-node";

// // Ensure to call this before importing any other modules!
// Sentry.init({
//   dsn: "https://f7d6397304c1809ce3cf354669dbe4c2@o4508403423510528.ingest.de.sentry.io/4508403427901520",
//   integrations: [
//     // Add our Profiling integration
//     nodeProfilingIntegration(),
//   ],

//   // Add Tracing by setting tracesSampleRate
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,

//   // Set sampling rate for profiling
//   // This is relative to tracesSampleRate
//   profilesSampleRate: 1.0,
// });
// instrument.js
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node"; // Optional: For profiling

Sentry.init({
  dsn: process.env.SENTRY_DSN, // You can store this in your .env file
  integrations: [
    // Add profiling integration if you're using it
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0, // Adjust as needed
  profilesSampleRate: 1.0, // Adjust as needed for profiling
});
