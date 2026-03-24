FROM node:20-slim

# Install Python 3.12, curl (for uv installer), and Wrangler
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip curl \
    && npm install -g wrangler \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv to a system-wide location (accessible to non-root users)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && cp /root/.local/bin/uv /usr/local/bin/ \
    && cp /root/.local/bin/uvx /usr/local/bin/ \
    && rm -rf /root/.local

# Docker's venv lives outside the project directory so it never conflicts
# with the host's .venv when the project is bind-mounted
ENV UV_PROJECT_ENVIRONMENT="/opt/venv"

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY pyproject.toml ./
RUN uv sync && chmod -R a+rwX /opt/venv

# Copy the rest of the project
COPY . .

EXPOSE 8787

CMD ["uv", "run", "pywrangler", "dev", "--ip", "0.0.0.0"]
