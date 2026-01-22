# D&D Companion - Back-end Server

⚠️ *Note*: all of these commands must be run inside the `server` directory.

```bash
# Install dependencies:
bun install
# Start up the postgres database
docker compose up
# Seed it with the 5e-SRD data:
bunx prisma db seed
# Start the GraphQL server:
bun run dev
```
