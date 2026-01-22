# D&D Companion - Back-end Server

To install dependencies:

```bash
bun install
```

To start up the database and seed it with the 5e-SRD data:

```bash
docker compose up
bunx prisma db seed
```
