"""Database models for the application."""
from datetime import datetime
from uuid import uuid4
from typing import Optional
import bcrypt
from .extensions import db
from .azure.storage import AzureStorageService

storage_service = AzureStorageService()


def generate_uuid():
    """Generate a UUID string."""
    return str(uuid4())

class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class User(TimestampMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120))
    profile_image_blob = db.Column(db.String(500), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)

    wallets = db.relationship("Wallet", back_populates="owner", cascade="all,delete", lazy="dynamic")

    def get_profile_image_url(self) -> Optional[str]:
        """Generate SAS URL for profile image"""
        if self.profile_image_blob:
            return storage_service.generate_sas_url(self.profile_image_blob)
        return None

    def set_password(self, password: str):
        # Truncate password to 72 bytes to avoid bcrypt length limit
        # This is safe as bcrypt only uses the first 72 bytes anyway
        password_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        # Truncate password to 72 bytes for consistency
        password_bytes = password.encode('utf-8')[:72]
        return bcrypt.checkpw(password_bytes, self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'profile_image_url': self.get_profile_image_url() if storage_service else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Wallet(TimestampMixin, db.Model):
    __tablename__ = "wallets"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.Enum("personal", "group", name="wallet_type"), nullable=False, default="personal")
    owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    owner = db.relationship("User", back_populates="wallets")
    members = db.relationship("WalletMember", back_populates="wallet", cascade="all,delete")
    transactions = db.relationship("Transaction", back_populates="wallet", cascade="all,delete")

class WalletMember(TimestampMixin, db.Model):
    __tablename__ = "wallet_members"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    role = db.Column(db.Enum("owner", "member", name="member_role"), nullable=False, default="member")

    wallet = db.relationship("Wallet", back_populates="members")
    user = db.relationship("User")

class Transaction(TimestampMixin, db.Model):
    __tablename__ = "transactions"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), nullable=False, index=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(120))
    date = db.Column(db.Date, nullable=False)
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    original_image_url = db.Column(db.String(255))
    ocr_raw_text = db.Column(db.Text)
    ocr_confidence = db.Column(db.Float)
    is_auto_categorized = db.Column(db.Boolean, default=False)

    wallet = db.relationship("Wallet", back_populates="transactions")
    creator = db.relationship("User")

class OCRJob(TimestampMixin, db.Model):
    __tablename__ = "ocr_jobs"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum("pending", "processing", "done", "error", name="ocr_status"), default="pending", nullable=False)
    raw_text = db.Column(db.Text)
    extracted_data = db.Column(db.JSON)
    error_message = db.Column(db.Text)

    user = db.relationship("User")