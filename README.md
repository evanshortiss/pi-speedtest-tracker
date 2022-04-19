# Speedtest Tracker

Runs a speedtest every hour, and store the results in an SQLite database.
Also provides a UI to view a summary of test results.

![](/screenshots/speedtest-ui.png)

## Usage

It's recommended that you run the container with a host folder mounted as a
volume for long-term storage of the speedtest results. Running the image
without specifying a `DB_PATH` that points to a volume will result in loss of
speedtest results once the container is stopped.

```bash
# Path on host machine to hold the speedtests SQLite file
export STORAGE_DIR="/home/$(whoami)/speedtest-tracker/"

# Create the storage location
mkdir $STORAGE_DIR

# Start a container, with the storage location mounted. The
# SPEEEDTEST_ACCEPT_LICENSE and SPEEEDTEST_ACCEPT_GDPR variables
# must be provided and set to "true"
docker run --name speedtester -p 8080:8080 \
-v $STORAGE_DIR:"/var/speedtest-tracker/":z \
-e DB_PATH="/var/speedtest-tracker/speedtest.sqlite.db" \
-e SPEEEDTEST_ACCEPT_LICENSE=true \
-e SPEEEDTEST_ACCEPT_GDPR=true \
evanshortiss/speedtest-tracker
```

## HTTP API

The server exposes an HTTP API complete with Swagger/OpenAPI documentation at
the `/swagger` endpoint.

## Development

### Tech Stack

- SQLite
- Node.js backend using fastify
- React UI using Next.js
- Tailwind CSS
- React Vis for graphs

### Starting in Development Modes

Tested with Node.js 16.x and npm 8.x. Start the application in development mode
using the following commands:

```
npm install
npm run dev
```

This will start a development server with live reload enabled.
