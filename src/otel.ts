import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Logs 관련 임포트
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

const serviceName = 'ai-web';
const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
});

// --- Trace 설정 ---
const traceExporter = new OTLPTraceExporter({
  url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
});

const tracerProvider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
});

tracerProvider.register({
  propagator: new W3CTraceContextPropagator(),
});

// --- Logs 설정 ---
const logExporter = new OTLPLogExporter({
  url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs',
});

const loggerProvider = new LoggerProvider({
  resource: resource,
  processors: [new BatchLogRecordProcessor(logExporter)],
});

// 전역 로그 프로바이더 등록
logs.setGlobalLoggerProvider(loggerProvider);

// --- 자동 인스트루멘테이션 ---
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost:4318/],
      propagateTraceHeaderCorsUrls: [
        /localhost:8080/,
      ],
    }),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost:4318/],
      propagateTraceHeaderCorsUrls: [/localhost:8080/],
    }),
  ],
});

// 편의를 위한 헬퍼 함수
export const appLogger = logs.getLogger(serviceName);

export const logInfo = (message: string, attributes?: Record<string, any>) => {
    appLogger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: message,
        attributes: attributes,
    });
};

export const logError = (message: string, error?: any, attributes?: Record<string, any>) => {
    appLogger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: message,
        attributes: {
            ...attributes,
            'error.message': error?.message,
            'error.stack': error?.stack,
        },
    });
};

logInfo('OpenTelemetry Trace & Logs initialized');
