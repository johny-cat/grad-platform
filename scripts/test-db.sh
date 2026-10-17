#!/usr/bin/env bash
# Test the database migrations on a throwaway local Postgres.
#
#   npm run test:db
#
# Steps: start an empty Postgres, add stand-ins for Supabase's roles and auth
# schema, apply every migration in order, load the program catalog, then run
# the tests in supabase/tests. Needs Postgres server binaries (initdb, pg_ctl).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PG_BIN="${PG_BIN:-}"
if [[ -z "$PG_BIN" ]]; then
  if command -v pg_config >/dev/null 2>&1 && [[ -x "$(pg_config --bindir)/initdb" ]]; then
    PG_BIN="$(pg_config --bindir)"
  else
    PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
  fi
fi
if [[ -z "$PG_BIN" || ! -x "$PG_BIN/initdb" ]]; then
  echo "Postgres server binaries not found. Install Postgres or set PG_BIN." >&2
  exit 1
fi

WORK="$(mktemp -d)"
DATA="$WORK/data"

# Postgres refuses to run as root; use the 'postgres' system user if needed.
as_pg() {
  if [[ "$(id -u)" == "0" ]]; then
    runuser -u postgres -- "$@"
  else
    "$@"
  fi
}
if [[ "$(id -u)" == "0" ]]; then
  chown postgres "$WORK"
fi

cleanup() {
  as_pg "$PG_BIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

as_pg "$PG_BIN/initdb" -D "$DATA" -U postgres --auth=trust -E UTF8 --locale=C --no-sync >/dev/null
as_pg "$PG_BIN/pg_ctl" -D "$DATA" -l "$WORK/postgres.log" -w \
  -o "-k $WORK -c listen_addresses='' -c fsync=off" start >/dev/null

run_sql() {
  echo "  - $(basename "$1")"
  "$PG_BIN/psql" -h "$WORK" -U postgres -d postgres -X -q -v ON_ERROR_STOP=1 -o /dev/null -f "$1"
}

echo "Applying Supabase stand-ins:"
run_sql "$ROOT/supabase/tests/00_supabase_stubs.sql"

echo "Applying migrations:"
for f in $(ls "$ROOT"/supabase/migrations/*.sql | sort); do
  run_sql "$f"
done

if [[ -f "$ROOT/supabase/seed/catalog.sql" ]]; then
  echo "Loading program catalog:"
  run_sql "$ROOT/supabase/seed/catalog.sql"
fi

echo "Running tests:"
for f in $(ls "$ROOT"/supabase/tests/[1-9]*.sql | sort); do
  run_sql "$f"
done
