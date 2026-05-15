export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Hook this up to Sentry / OpenTelemetry / Datadog when ready.
    // Example:
    //   await import("./instrumentation.node");
  }
}
