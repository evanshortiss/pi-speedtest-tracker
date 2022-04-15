import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { ResultEvent } from 'speedtest-net';
import get from 'lodash.get';
import {
  ColumnName,
  NormalisationConfig,
  NormalisedSpeedtestResult,
} from '../datatypes';
import server from '../server';

declare module 'fastify' {
  interface FastifyInstance {
    sqlite: DatabaseWrapper;
  }
}

export default fp(fastifySqlite, {
  fastify: '>=3',
  name: 'fastify-sqlite',
});

export type FastifySqliteOpts = {
  filepath: string;
};

type AverageKeys =
  | `AVG(${ColumnName.DownloadBandwidth})`
  | `AVG(${ColumnName.PingLatency})`
  | `AVG(${ColumnName.UploadBandwidth})`;

type AveragesQueryResult = {
  [K in AverageKeys]: number;
};

export interface DatabaseWrapper {
  getAverages: () => Promise<{
    download?: number;
    upload?: number;
    ping?: number;
  }>;
  writeTestResult: (result: ResultEvent) => void;
  getRecordsInDateRange: (
    begin: Date,
    end: Date,
    fields?: ColumnName[]
  ) => Promise<NormalisedSpeedtestResult[]>;
}

async function fastifySqlite(
  fastify: FastifyInstance,
  opts: FastifySqliteOpts,
  next: (err?: Error) => void
) {
  fastify.log.debug('initialising sqlite database plugin');

  const db: Database<sqlite3.Database, sqlite3.Statement> = await open({
    filename: opts.filepath,
    driver: sqlite3.Database,
  });

  const createStatement = `CREATE TABLE IF NOT EXISTS speedtests (${generateColumnNames()}, CONSTRAINT result_id_pk PRIMARY KEY (${
    ColumnName.ResultId
  }))`;
  const indexStatement =
    'CREATE INDEX IF NOT EXISTS timestamp_index ON speedtests (timestamp);';

  fastify.log.debug(`Create database table. SQL is: ${createStatement}`);
  await db.exec(createStatement);

  fastify.log.debug(`Adding database index. SQL is: ${indexStatement}`);
  await db.exec(indexStatement);

  fastify.decorate('sqlite', {
    getAverages: async () => {
      const averages = await db.get<AveragesQueryResult>(
        `SELECT AVG(${ColumnName.DownloadBandwidth}),AVG(${ColumnName.UploadBandwidth}),AVG(${ColumnName.PingLatency}) FROM speedtests`
      );

      return {
        download: averages?.['AVG(download_bandwidth)'],
        upload: averages?.['AVG(upload_bandwidth)'],
        ping: averages?.['AVG(ping_latency)'],
      };
    },
    getRecordsInDateRange: (begin: Date, end: Date, fields?: ColumnName[]) => {
      let selection = '*';

      if (fields) {
        selection = fields.join(',');
      }

      const sql = `SELECT ${selection} FROM speedtests WHERE timestamp BETWEEN '${begin.toISOString()}' AND '${end.toISOString()}'`;
      server.log.debug(`querying speedtests. SQL: ${sql}`);
      return db.all(sql);
    },
    writeTestResult: async (result: ResultEvent) => {
      const columns = generateColumnNames();
      const values = Object.values(normaliseSpeedtestResult(result))
        .map((v) => {
          if (typeof v === 'string') {
            return `"${v}"`;
          } else if (!v) {
            return 'NULL';
          }
          {
            return v;
          }
        })
        .join(',');

      const sql = `INSERT INTO speedtests(${columns}) VALUES (${values})`;

      server.log.debug(`inserting speedtest result. SQL: ${sql}`);

      await db.run(sql);
    },
  });

  fastify.log.debug('finished sqlite plugin initialisation');
  next();
}

function normaliseSpeedtestResult(
  record: ResultEvent
): NormalisedSpeedtestResult {
  return Object.keys(NormalisationConfig).reduce((result, key) => {
    const config = NormalisationConfig[key as ColumnName];

    let value = get(record, config.Key);

    if (value instanceof Date) {
      value = value.toISOString();
    }

    return {
      ...result,
      [key]: value,
    };
  }, {} as NormalisedSpeedtestResult);
}

function generateColumnNames(): string {
  return Object.keys(NormalisationConfig).join(',');
}
