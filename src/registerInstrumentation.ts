import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource, envDetector, hostDetector, osDetector, processDetector } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import * as process from 'process';

type DisabledService = Record<string, { enabled: boolean }>;

const servicesToDisable = [
	"@opentelemetry/instrumentation-amqplib",
	"@opentelemetry/instrumentation-aws-lambda",
	"@opentelemetry/instrumentation-aws-sdk",
	"@opentelemetry/instrumentation-bunyan",
	"@opentelemetry/instrumentation-cassandra-driver",
	"@opentelemetry/instrumentation-connect",
	"@opentelemetry/instrumentation-cucumber",
	"@opentelemetry/instrumentation-dataloader",
	"@opentelemetry/instrumentation-fastify",
	"@opentelemetry/instrumentation-fs",
	"@opentelemetry/instrumentation-generic-pool",
	"@opentelemetry/instrumentation-graphql",
	"@opentelemetry/instrumentation-grpc",
	"@opentelemetry/instrumentation-hapi",
	"@opentelemetry/instrumentation-ioredis",
	"@opentelemetry/instrumentation-knex",
	"@opentelemetry/instrumentation-koa",
	"@opentelemetry/instrumentation-lru-memoizer",
	"@opentelemetry/instrumentation-memcached",
	"@opentelemetry/instrumentation-mongodb",
	"@opentelemetry/instrumentation-mongoose",
	"@opentelemetry/instrumentation-mysql2",
	"@opentelemetry/instrumentation-mysql",
	"@opentelemetry/instrumentation-pino",
	"@opentelemetry/instrumentation-redis",
	"@opentelemetry/instrumentation-redis-4",
	"@opentelemetry/instrumentation-restify",
	"@opentelemetry/instrumentation-router",
	"@opentelemetry/instrumentation-socket.io",
	"@opentelemetry/instrumentation-tedious"
  ];
  
  const pgTraceOptions = {
	  addSqlCommenterCommentToQueries: true,
	  enabled: true,
	  enhancedDatabaseReporting: true,
	  requireParentSpan: true,
  };
  	const servicesToEnable = {
		'@opentelemetry/instrumentation-express': {
			enabled: true,
		},
		'@opentelemetry/instrumentation-nestjs-core': {
			enabled: true,
		},
		'@opentelemetry/instrumentation-pg': pgTraceOptions,
		'@opentelemetry/instrumentation-winston': {
			enabled: true,
		}
	};

  const disableServices = servicesToDisable.reduce(
	(acc: DisabledService, service: string) => {
	  if (!acc[service]) {
		acc[service] = {
		  enabled: false,
		};
	  }
  
	  return acc;
	},
	{} as DisabledService
  );

/* const collectorConfig = (route) => ({
	url: 'http://opentelemetry-collector:4318/v1/' + route
}); */

const traceExporter = new OTLPTraceExporter();

export const otelSDK = new NodeSDK({
	traceExporter,
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'api-poc-auto-instrumentation',
		[SEMRESATTRS_SERVICE_VERSION]: '1.0',
	}),
	spanProcessors: [new SimpleSpanProcessor(traceExporter)],
	instrumentations: [
		getNodeAutoInstrumentations({
			...servicesToEnable,
			...disableServices
		})
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