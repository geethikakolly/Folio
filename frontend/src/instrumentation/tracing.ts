/**
 * OpenTelemetry Instrumentation for Frontend
 * Initializes tracing, auto-instrumentation of fetch/XHR, and custom spans
 */

import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import {
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions'

export function initializeTracing(): void {
  const otlpExporter = new OTLPTraceExporter({
    url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  })

  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'folio-frontend',
      [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    }),
  )

  const provider = new BasicTracerProvider({ resource })
  provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter))

  // Register auto-instrumentations for web
  registerInstrumentations({
    instrumentations: [getWebAutoInstrumentations()],
  })
}

/**
 * Get the current tracer instance
 */
export function getTracer() {
  const { trace } = require('@opentelemetry/api')
  return trace.getTracer('folio-frontend', '0.1.0')
}

/**
 * Create a custom span for tracking operations
 * @param name - Span name
 * @param fn - Function to execute within the span
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  const tracer = getTracer()
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn()
      span.setStatus({ code: 0 })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: 2 })
      throw error
    } finally {
      span.end()
    }
  })
}
