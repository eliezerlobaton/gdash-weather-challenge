# Use Python 3.13 slim for smaller image size
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py config.py ./
COPY interfaces/ ./interfaces/
COPY weather/ ./weather/
COPY messaging/ ./messaging/

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Health check - verify the application can start
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "from config import Config; print('Config loaded')" || exit 1

# Run the application
CMD ["python", "main.py"]