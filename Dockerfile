# ---- Base stage: Node 24 + npm workspace deps ----
FROM node:24-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY astro-app/package.json astro-app/
COPY studio/package.json studio/
RUN npm ci && chown -R node:node /app
ENV PATH=/app/node_modules/.bin:$PATH
USER node

# ---- Astro dev server ----
FROM base AS dev-astro
WORKDIR /app/astro-app
EXPOSE 4321
CMD ["astro", "dev", "--host"]

# ---- Sanity Studio dev server ----
FROM base AS dev-studio
WORKDIR /app/studio
EXPOSE 3333
CMD ["sanity", "dev", "--host", "0.0.0.0"]

# ---- Storybook dev server ----
FROM base AS dev-storybook
WORKDIR /app/astro-app
EXPOSE 6006
CMD ["storybook", "dev", "-p", "6006", "--host", "0.0.0.0"]
