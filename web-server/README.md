# Orca Web Server

Orca's web server is designed to receive grading jobs from Bottlenose and push them onto the grading queue accordingly.

## Running the Redis Server

The web server is currently configured to connect to the Redis default port of 6379

```
redis-server
```

If registered as a service, you can use the following commands to start and stop the server.

```
sudo service redis-server start
```

```
sudo service redis-server stop
```

Access the Redis client

```
redis-cli
```

## Running the Web Server

- The Redis server should be running already for the web server to connect.

Go to the web-server directory

Install dependencies

```
yarn install
```

Run the server

```
yarn start
```
