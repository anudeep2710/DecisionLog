"""Copy an existing DecisionLog SQLite database into PostgreSQL.

This is intended for a one-time migration before switching the service to
Neon. The target database is created by the ORM if it does not exist yet.
Existing PostgreSQL rows are left untouched when their primary key already
exists, so the command can be safely resumed after an interrupted run.
"""

import argparse
import os

from sqlalchemy import create_engine, inspect
from sqlalchemy.dialects.postgresql import insert as postgres_insert

from database import Base, normalize_database_url
import models  # noqa: F401 - registers all ORM tables on Base.metadata


def make_engine(database_url: str):
    normalized_url = normalize_database_url(database_url)
    connect_args = {"check_same_thread": False} if normalized_url.startswith("sqlite") else {}
    return create_engine(normalized_url, connect_args=connect_args, pool_pre_ping=True)


def migrate(source_url: str, target_url: str) -> None:
    source_engine = make_engine(source_url)
    target_engine = make_engine(target_url)

    try:
        Base.metadata.create_all(bind=target_engine)
        source_tables = set(inspect(source_engine).get_table_names())
        migrated_rows = 0

        for table in Base.metadata.sorted_tables:
            if table.name not in source_tables:
                continue

            with source_engine.connect() as source_connection:
                rows = [dict(row._mapping) for row in source_connection.execute(table.select())]

            if not rows:
                continue

            with target_engine.begin() as target_connection:
                for row in rows:
                    if target_engine.dialect.name == "postgresql":
                        statement = postgres_insert(table).values(**row).on_conflict_do_nothing()
                    else:
                        statement = table.insert().values(**row)
                    target_connection.execute(statement)

            migrated_rows += len(rows)
            print(f"{table.name}: copied {len(rows)} rows")

        print(f"Migration complete: {migrated_rows} rows processed")
    finally:
        source_engine.dispose()
        target_engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        default=os.getenv("SOURCE_DATABASE_URL", "sqlite:///./decisionlog.db"),
        help="Existing SQLite/PostgreSQL URL (default: SOURCE_DATABASE_URL or local SQLite)",
    )
    parser.add_argument(
        "--target",
        default=os.getenv("DATABASE_URL"),
        help="Neon PostgreSQL URL (default: DATABASE_URL)",
    )
    args = parser.parse_args()

    if not args.target:
        parser.error("--target or DATABASE_URL is required")

    migrate(args.source, args.target)


if __name__ == "__main__":
    main()
