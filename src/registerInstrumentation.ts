import {
	ConsoleSpanExporter,
	SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import * as process from 'process';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const traceExporter = new ConsoleSpanExporter();

export const otelSDK = new NodeSDK({

	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'api-poc-auto-instrumentation',
		[SEMRESATTRS_SERVICE_VERSION]: '1.0',
	}),
	traceExporter: traceExporter,
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