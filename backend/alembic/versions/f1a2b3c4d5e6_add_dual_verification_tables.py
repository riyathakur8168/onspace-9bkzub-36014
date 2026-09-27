"""add_dual_verification_tables

Revision ID: f1a2b3c4d5e6
Revises: e99f7a8b2c1d
Create Date: 2026-09-27 13:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'e99f7a8b2c1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new verification fields to users table
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('aadhaar_verified', sa.Boolean(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('aadhaar_number_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('aadhaar_verification_reference', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('aadhaar_verified_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))
    
    op.create_index(op.f('ix_users_aadhaar_number_hash'), 'users', ['aadhaar_number_hash'], unique=False)

    # Create signup_verification_sessions table
    op.create_table(
        'signup_verification_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_number_hash', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_client_id', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_verified', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('aadhaar_verification_reference', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_otp_hash', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_otp_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('aadhaar_otp_attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('last_aadhaar_otp_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('email_verified', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('email_otp_hash', sa.String(length=255), nullable=True),
        sa.Column('email_otp_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('email_otp_attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('last_email_otp_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_signup_verification_sessions_id'), 'signup_verification_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_signup_verification_sessions_session_id'), 'signup_verification_sessions', ['session_id'], unique=True)
    op.create_index(op.f('ix_signup_verification_sessions_email'), 'signup_verification_sessions', ['email'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_signup_verification_sessions_email'), table_name='signup_verification_sessions')
    op.drop_index(op.f('ix_signup_verification_sessions_session_id'), table_name='signup_verification_sessions')
    op.drop_index(op.f('ix_signup_verification_sessions_id'), table_name='signup_verification_sessions')
    op.drop_table('signup_verification_sessions')

    op.drop_index(op.f('ix_users_aadhaar_number_hash'), table_name='users')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'aadhaar_verified_at')
    op.drop_column('users', 'aadhaar_verification_reference')
    op.drop_column('users', 'aadhaar_number_hash')
    op.drop_column('users', 'aadhaar_verified')
    op.drop_column('users', 'email_verified')
