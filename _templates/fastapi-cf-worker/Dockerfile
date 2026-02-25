FROM node:20-slim

# Install Python 3.12, curl (for uv installer), and Wrangler
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip curl \
    && npm install -g wrangler \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv — the fast Python package manager used by Pywrangler
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY pyproject.toml ./
RUN uv sync

# Copy the rest of the project
COPY . .

EXPOSE 8787

CMD ["uv", "run", "pywrangler", "dev", "--ip", "0.0.0.0"]
