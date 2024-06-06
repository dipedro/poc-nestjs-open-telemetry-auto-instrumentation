import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { Resource, envDetector, hostDetector, osDetector, processDetector } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import * as process from 'process';

const collectorConfig = (route) => ({
	url: 'http://opentelemetry-collector:4318/v1/' + route
});

const traceExporter = new OTLPTraceExporter(collectorConfig('traces'));

const pgTraceOptions = {
	addSqlCommenterCommentToQueries: true,
	enabled: true,
	enhancedDatabaseReporting: true,
	requireParentSpan: true,
};

export const otelSDK = new NodeSDK({
	traceExporter,
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'api-poc-auto-instrumentation',
		[SEMRESATTRS_SERVICE_VERSION]: '1.0',
	}),
	//logRecordProcessor: new OTLPLogExporter(collectorConfig('logs')),
	/* metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(collectorConfig('metrics')),
	}), */
	/* spanProcessors: [new SimpleSpanProcessor(traceExporter)], */
	/* instrumentations: [
		getNodeAutoInstrumentations(),
		new PgInstrumentation(),
	], */
	/* textMapPropagator: new CompositePropagator({
		propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
	  }), */
	instrumentations: [
		new NestInstrumentation(),
		new PgInstrumentation(pgTraceOptions),
		//getNodeAutoInstrumentations()
	],
	resourceDetectors: [
	  envDetector,
	  hostDetector,
	  osDetector,
	  processDetector,
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