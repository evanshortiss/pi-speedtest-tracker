import fastify from 'fastify';
import { ColumnName, NormalisedSpeedtestResult } from './datatypes';
import { bytesToMegabits } from './utils';
import fastifySpeedtestSqlite from './plugins/sqlite';
import fastifySpeedtest from './plugins/speedtest';
import config from './config';
import 'fastify-nextjs';
import { Server } from 'http';

const useDevMode = config.NODE_ENV === 'development';
const server = fastify({
  logger: {
    level: useDevMode ? 'debug' : 'info',
  },
});

server.register(fastifySpeedtestSqlite, {
  filepath: config.DB_PATH,
});

server
  .register(fastifySpeedtest, {
    speedtestOpts: {
      acceptLicense: config.SPEEEDTEST_ACCEPT_LICENSE,
      acceptGdpr: config.SPEEEDTEST_ACCEPT_GDPR,
      serverId: config.SPEEEDTEST_SERVER_ID,
    },
  })
  .after((err) => {
    if (err) throw err;

    server.speedtest.on('started', () => {
      server.log.info('a speedtest has started');
    });

    server.speedtest.on('success', (record) => {
      try {
        server.log.debug('speedtest result', record);
        server.sqlite.writeTestResult(record);
      } catch (e) {
        server.log.error('failed to write speedtest to sqlite', e);
      }
    });

    server.speedtest.on('fail', (err) => {
      server.log.error('encountered an issue when executing speedtest');
      server.log.error(err as any);
    });
  });

server
  .register(require('fastify-nextjs'), {
    noServeAssets: false,
    logLevel: useDevMode ? 'debug' : 'error',
    dev: useDevMode,
  })
  .after((err) => {
    if (err) throw err;

    // Capture all routes using Next and serve matching pages
    server.next('/*');
  });

server.get('/health', (req, res) => {
  res.send({
    status: 'ok',
    curtime: new Date().toJSON(),
    uptime: `${process.uptime} seconds`,
  });
});

server.post('/api/test', (req, reply) => {
  if (server.speedtest.run()) {
    reply.send('speedtest run scheduled');
  } else {
    reply
      .status(503)
      .send('A speedtest is currently in progress. Try again later.');
  }
});

server.get('/api/history', () => {
  const date = new Date();

  date.setDate(date.getDate() - 28);

  return server.sqlite.getRecordsInDateRange(date, new Date());
});

server.route({
  method: 'GET',
  url: '/api/summary',
  handler: async () => {
    const date = new Date();

    date.setDate(date.getDate() - 28);

    const results = await Promise.all([
      server.sqlite.getRecordsInDateRange(date, new Date(), [
        ColumnName.ResultId,
        ColumnName.Timestamp,
        ColumnName.DownloadBandwidth,
        ColumnName.UploadBandwidth,
        ColumnName.PingLatency,
      ]),
      server.sqlite.getAverages(),
    ]);

    let latest: NormalisedSpeedtestResult | undefined;

    if (results[0].length !== 0) {
      latest = results[0][results[0].length - 1];
    }

    if (!latest) {
      return {};
    } else {
      return {
        latest: {
          download: bytesToMegabits(latest.download_bandwidth || 0).toFixed(2),
          upload: bytesToMegabits(latest.upload_bandwidth || 0).toFixed(2),
          ping: latest.ping_latency?.toFixed(2),
          ts: latest.timestamp,
        },
        averages: {
          download: bytesToMegabits(results[1].download || 0).toFixed(2),
          upload: bytesToMegabits(results[1].upload || 0).toFixed(2),
          ping: results[1].ping?.toFixed(2),
        },
      };
    }
  },
});

export default server;
