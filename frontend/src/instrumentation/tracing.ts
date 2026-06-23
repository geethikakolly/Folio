/**
 * OpenTelemetry Instrumentation for Frontend
 * Initializes tracing, auto-instrumentation of fetch/XHR, and custom spans
 */

import { trace, SpanStatusCode } from '@opentelemetry/api'
import type { Span } from '@opentelemetry/api'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

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
  provider.register() // registers as global TracerProvider so auto-instrumentations can export

  registerInstrumentations({
    instrumentations: [getWebAutoInstrumentations()],
  })
}

export function getTracer() {
  return trace.getTracer('folio-frontend', '0.1.0')
}

export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  const tracer = getTracer()
  return tracer.startActiveSpan(name, async (span: Span) => {
    try {
      const result = await fn()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  })
}
