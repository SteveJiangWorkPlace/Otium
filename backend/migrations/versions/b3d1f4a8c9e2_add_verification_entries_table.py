"""Add verification_entries table

Revision ID: b3d1f4a8c9e2
Revises: af7f0ba9b1a8
Create Date: 2026-05-12 00:00:00.000000

"""
from collections.abc import Sequence

import logging
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b3d1f4a8c9e2"
down_revision: str | Sequence[str] | None = "af7f0ba9b1a8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("verification_entries"):
        logging.warning("verification_entries table already exists, skip migration create_table")
        return

    op.create_table(
        "verification_entries",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("purpose", sa.String(50), nullable=False),
        sa.Column("token_key", sa.String(512), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("value", sa.String(512), nullable=False),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index(op.f("ix_verification_entries_purpose"), "verification_entries", ["purpose"])
    op.create_index(op.f("ix_verification_entries_token_key"), "verification_entries", ["token_key"])
    op.create_index(op.f("ix_verification_entries_email"), "verification_entries", ["email"])
    op.create_index(op.f("ix_verification_entries_expires_at"), "verification_entries", ["expires_at"])

    logging.info("Created verification_entries table")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("verification_entries"):
        logging.warning("verification_entries table not found, skip migration drop_table")
        return

    op.drop_index(op.f("ix_verification_entries_expires_at"), table_name="verification_entries")
    op.drop_index(op.f("ix_verification_entries_email"), table_name="verification_entries")
    op.drop_index(op.f("ix_verification_entries_token_key"), table_name="verification_entries")
    op.drop_index(op.f("ix_verification_entries_purpose"), table_name="verification_entries")
    op.drop_table("verification_entries")

    logging.info("Dropped verification_entries table")
