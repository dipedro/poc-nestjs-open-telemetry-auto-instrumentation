import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { api } from '@opentelemetry/sdk-node';

type ExceptionResponsePayload = {
    statusCode: number;
    timestamp: string;
    path: string;
    message: string;
    stack: string;
    body?: any;
    queryParams?: Record<string, any>;
};

@Catch()
export class HttpFilterException implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const isExceptionGeneratedByDev = exception instanceof HttpException;

        if (isExceptionGeneratedByDev) {
            const status = exception.getStatus();

            const isInternalServerError =
                status === HttpStatus.INTERNAL_SERVER_ERROR;

            if (!isInternalServerError)
                return response.status(status).json(exception.getResponse());
        }

        const payload = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            method: request.method,
            timestamp: new Date().toISOString(),
            path: request.route.path,
            message: exception.message,
            stack: exception.stack,
        } as ExceptionResponsePayload;

        if (request.body && Object.keys(request.body).length) {
            payload.body = request.body;
        }

        if (request.query && Object.keys(request.query).length) {
            payload.queryParams = request.query;
        }

		const span = api.trace.getTracer(request.route.path).startSpan('exception');
		api.context.with(api.trace.setSpan(api.context.active(), span), () => {
			span.addEvent('global catch()');
			span.setAttribute('response', JSON.stringify(payload));
			span.end();
		});

        return response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(payload);
    }
}
