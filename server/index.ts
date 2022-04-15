import config from './config';
import server from './server';

server.listen(config.HTTP_PORT, '0.0.0.0');
