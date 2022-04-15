import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { EventEmitter } from 'events';
import speedtest from 'speedtest-net';
import TypedEmitter from 'typed-emitter';

declare module 'fastify' {
  interface FastifyInstance {
    speedtest: Speedtest;
  }
}

export default fp(fastifySpeedtest, {
  fastify: '>=3',
  name: 'fastify-speedtest',
});

export type SpeedtestConfig = {
  speedtestOpts: {
    acceptLicense: boolean;
    acceptGdpr: boolean;
    serverId?: string;
  };
};

type SpeedtestEvents = {
  success: (result: speedtest.ResultEvent) => void;
  fail: (err: unknown) => void;
  started: () => void;
};

async function fastifySpeedtest(
  fastify: FastifyInstance,
  opts: SpeedtestConfig,
  next: (err?: Error) => void
) {
  const { speedtestOpts } = opts;

  const speedtester = new Speedtest({
    speedtestOpts,
  });

  fastify.decorate('speedtest', speedtester);
}

export class Speedtest extends (EventEmitter as new () => TypedEmitter<SpeedtestEvents>) {
  private runningTest: boolean;

  constructor(private config: SpeedtestConfig) {
    super();

    this.runningTest = false;
    this.scheduleNextTest();
  }

  private scheduleNextTest(): void {
    const nextTs = new Date();

    nextTs.setHours(nextTs.getHours() + 1);
    nextTs.setMinutes(0);
    nextTs.setSeconds(0);
    nextTs.setMilliseconds(0);

    const waitMillis = nextTs.getTime() - Date.now();

    setTimeout(() => this.run(), waitMillis);
  }

  public run() {
    if (this.runningTest) {
      return false;
    } else {
      this.runningTest = true;
      this.emit('started');
      speedtest({
        ...this.config.speedtestOpts,
      })
        .then((result) => this.emit('success', result))
        .catch((err) => this.emit('fail', err))
        .finally(() => {
          this.runningTest = false;
          this.scheduleNextTest();
        });

      return true;
    }
  }
}
