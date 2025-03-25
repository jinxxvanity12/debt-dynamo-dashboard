
# Savings Saga - Personal Finance Tracker

## Running with Docker

This application can be run in a Docker container with a PostgreSQL database for data persistence.

### Prerequisites

- Docker
- Docker Compose

### Getting Started

1. Clone this repository
2. Open a terminal and navigate to the project directory
3. Run the following command to start the application:

```bash
docker-compose up -d
```

This will:
- Build the application Docker image
- Start the PostgreSQL database container
- Start the application container
- Map the application to port 80 on your host machine
- Set up a persistent volume for the database data

### Troubleshooting Docker Issues

#### Network Connectivity Issues

If you encounter errors like:
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": dial tcp: lookup registry-1.docker.io: server misbehaving
```

Try these solutions:

1. **Check your internet connection** - Ensure you have a stable internet connection.

2. **Configure DNS** - Update your DNS settings:
   ```bash
   # Edit resolv.conf
   sudo nano /etc/resolv.conf
   
   # Add Google's public DNS servers
   nameserver 8.8.8.8
   nameserver 8.8.4.4
   ```

3. **Restart Docker service**:
   ```bash
   sudo systemctl restart docker
   ```

4. **Pull images explicitly** before running docker-compose:
   ```bash
   docker pull postgres:13
   docker pull node:16-alpine
   ```

5. **Use a VPN** if your ISP is blocking Docker Hub.

### Accessing the Application

Once the containers are running, you can access the application by navigating to:

```
http://localhost
```

### Database Backup

The PostgreSQL database data is stored in a Docker volume named `db-data`. This ensures that your data persists even if the containers are stopped or removed.

To create a backup of your database:

```bash
docker exec -t savings-saga-db-1 pg_dump -U user savings_saga > backup.sql
```

To restore from a backup:

```bash
cat backup.sql | docker exec -i savings-saga-db-1 psql -U user -d savings_saga
```

### Stopping the Application

To stop the application:

```bash
docker-compose down
```

To stop the application and remove the volumes (will delete all data):

```bash
docker-compose down -v
```

## Note on Database Integration

For proper database integration, you would need to:

1. Add an API layer to connect the frontend to the database
2. Implement authentication that works with the database
3. Use an ORM or SQL queries to store and retrieve data

This Docker setup provides the infrastructure, but you'll need to extend the application code to make full use of the database.
