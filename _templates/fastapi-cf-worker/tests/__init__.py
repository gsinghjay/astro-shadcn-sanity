"""Tests for the FastAPI Cloudflare Worker template.

Tests import from ``app.py`` (never ``main.py``) because ``main.py``
requires the Workers Pyodide runtime which is unavailable in standard Python.
"""
