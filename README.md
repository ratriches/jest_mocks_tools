# Example Jest Mock Tools

A set of locally defined mocks, mock packages, and jest

Docker environment with Redis, NSQ, MongoDB and example_jmt service.
The main objective is to demonstrate the use of mocks (in packages or local) across various code layers, such as route layers (using express), service layers (using redis and NSQ), and model layers (using mongo/mongoose)

Note: service ports have been modified to avoid conflicts with other services running on your PC.

## Services

- **Redis**: Cache and in-memory data storage (port 16379)
- **NSQ**: Distributed messaging system
  - nsqlookupd: port 14160 (TCP), 14161 (HTTP)
  - nsqd: port 14150 (TCP), 14151 (HTTP)
  - nsqadmin: port 14171 (web interface)
- **MongoDB**: NoSQL database (port 37017)
  - User: admin
  - Password: password
  - Database: example_jmt_db
- **example_jmt**: Main application (port 13000)

## How to use

### Start all services

```bash
cd compose
docker-compose up -d
```

### View logs

```bash
cd compose
docker-compose logs -f example_jmt
```

### Stop all services

```bash
cd compose
docker-compose down
```

### Stop and remove volumes

```bash
cd compose
docker-compose down -v
```

### Rebuild the example_jmt service

```bash
cd compose
docker-compose up -d --build example_jmt
```

## Accessing the services

- **example_jmt Application**: http://localhost:13000
- **NSQ Admin**: http://localhost:14171
- **MongoDB**: mongodb://admin:password@localhost:37017/example_jmt_db?authSource=admin
- **Redis**: localhost:16379

## Development

Application files are mounted as a volume, so code changes are automatically reflected (if using nodemon).

## Notes
The docker-compose.yml and Dockerfile.dev are implemented in such a way that node_modules stays only inside the image, thus ensuring "isolation" between local environment configurations and those defined by the dockerfile.
