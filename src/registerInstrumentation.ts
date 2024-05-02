import {
	SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import * as process from 'process';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const baseLimeConfig = (route) => ({
	url: 'vendor base URL' + route,
	headers: {
		'x-api-key': ''
	},
});

const traceExporter = new OTLPTraceExporter(baseLimeConfig('traces'));

export const otelSDK = new NodeSDK({
	traceExporter,
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(baseLimeConfig('metrics')),
	  }),
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'api-poc-auto-instrumentation',
		[SEMRESATTRS_SERVICE_VERSION]: '1.0',
	}),
	spanProcessor: new SimpleSpanProcessor(traceExporter),
	instrumentations: [
		new HttpInstrumentation(), 
		new ExpressInstrumentation(),
	],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
otelSDK
	.shutdown()
	.then(
	() => console.log('SDK shut down successfully'),
	(err) => console.log('Error shutting down SDK', err),
	)
	.finally(() => process.exit(0));
});