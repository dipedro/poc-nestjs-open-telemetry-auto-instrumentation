import { Pool } from 'pg';

export class Pg {
	private static instance: Pg;
  	private pool: Pool;

	public constructor() {
		this.pool = new Pool({
			user: process.env.PG_USER,
			host: process.env.PG_HOST,
			database: process.env.PG_DATABASE,
			password: process.env.PG_PASSWORD,
			port: parseInt(process.env.PG_PORT),
		});
	}

	public static getInstance(): Pg {
		if (!Pg.instance) {
			Pg.instance = new Pg();
		}

		return Pg.instance;
	}

	public async query(query: string, values: any[] = []): Promise<any> {
		const client = await this.pool.connect();
		try {
			return client.query(query, values);
		} finally {
			client.release();
		}
	}
}