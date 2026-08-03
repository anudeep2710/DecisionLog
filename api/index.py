"""Vercel entry point for the shared DecisionLog FastAPI application."""

import os
import sys
from urllib.parse import parse_qs, urlencode


# Vercel imports this file from the repository root. Reuse the same app as the
# Docker/Railway deployment so the routes cannot drift between hosts.
backend_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
)
sys.path.insert(0, backend_dir)

from main import app  # noqa: E402


class VercelPathNormalizer:
    """Expose FastAPI's root routes below Vercel's ``/api`` function path."""

    def __init__(self, application):
        self.application = application

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            query_string = scope.get("query_string", b"")
            query = parse_qs(query_string.decode("utf-8"), keep_blank_values=True)
            routed_path = query.pop("__vercel_path", [None])[0]

            if routed_path is not None:
                scope = dict(scope)
                scope["path"] = routed_path or "/"
                scope["raw_path"] = scope["path"].encode("utf-8")
                scope["query_string"] = urlencode(query, doseq=True).encode("utf-8")
            else:
                path = scope.get("path", "")
                if path == "/api" or path.startswith("/api/"):
                    scope = dict(scope)
                    normalized_path = path[4:] or "/"
                    scope["path"] = normalized_path

                    raw_path = scope.get("raw_path")
                    if raw_path:
                        scope["raw_path"] = raw_path[4:] or b"/"

        await self.application(scope, receive, send)


app = VercelPathNormalizer(app)
