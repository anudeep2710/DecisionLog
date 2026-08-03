"""Vercel entry point for the shared DecisionLog FastAPI application."""

import os
import sys


# Vercel imports this file from the repository root. Reuse the same app as the
# Docker/Railway deployment so the routes cannot drift between hosts.
backend_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
)
sys.path.insert(0, backend_dir)

from main import app  # noqa: E402
