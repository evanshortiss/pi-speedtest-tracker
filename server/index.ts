import config from './config';
import server from './server';

server.listen(config.HTTP_PORT, '0.0.0.0');

const shutdown = (sig: string) => {
  server.log.info(
    `shutting down server due to ${sig} signal. waiting 10s for connections to close`
  );
  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    server.log.warn(
      'server took too long to close. terminating process anyway'
    );
    process.exit(1);
  }, 10000);
};

['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));
