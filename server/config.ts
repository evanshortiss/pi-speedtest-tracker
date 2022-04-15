import { get } from 'env-var';
import { homedir } from 'os';
import { join } from 'path';

const DB_PATH_DEFAULT = join(homedir(), 'speedtest.db');

export default {
  HTTP_PORT: get('HTTP_PORT').default(8080).asPortNumber(),
  DB_PATH: get('DB_PATH').default(DB_PATH_DEFAULT).asString(),
  NODE_ENV: get('NODE_ENV').required().asEnum(['development', 'production']),

  SPEEEDTEST_ACCEPT_LICENSE: get('SPEEEDTEST_ACCEPT_LICENSE')
    .default('false')
    .asBool(),
  SPEEEDTEST_ACCEPT_GDPR: get('SPEEEDTEST_ACCEPT_GDPR')
    .default('false')
    .asBool(),
  SPEEEDTEST_SERVER_ID: get('SPEEEDTEST_SERVER_ID').asString(),
};
