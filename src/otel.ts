import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Initialize the OTLP Trace Exporter
const exporter = new OTLPTraceExporter({
  url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
  headers: {},
});

// Configure the Tracer Provider
const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'ai-web',
  }),
  spanProcessors: [new BatchSpanProcessor(exporter)],
});

// Register the Provider with W3C Trace Context Propagator
// This enables the browser to send 'traceparent' headers to the backend
provider.register({
  propagator: new W3CTraceContextPropagator(),
});

// Register Automatic Instrumentations
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost:4318/],
      // IMPORTANT: Configure which URLs should receive the trace headers.
      // Add your Spring Boot server URL pattern here.
      propagateTraceHeaderCorsUrls: [
        /localhost:8080/, // Standard Spring Boot port
        // Add other API endpoints as needed, e.g., /https:\/\/api\.example\.com/
      ],
    }),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost:4318/],
      propagateTraceHeaderCorsUrls: [/localhost:8080/],
    }),
  ],
});

console.log('OpenTelemetry initialized with Trace Context Propagation');
