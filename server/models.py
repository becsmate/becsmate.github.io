from datetime import datetime
from uuid import uuid4

from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash


def generate_uuid():
    return str(uuid4())


class WalletMember(db.Model):
    __tablename__ = "wallet_members"

    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), primary_key=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Association table only; relationships are defined on User/Wallet models.


class WalletInvitation(db.Model):
    __tablename__ = "wallet_invitations"
    __table_args__ = (
        db.UniqueConstraint("wallet_id", "invited_user_id", name="uq_wallet_invitee"),
    )

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), nullable=False)
    invited_user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False
    )
    invited_by_user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False
    )
    status = db.Column(db.String(20), default="pending", nullable=False)
    responded_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    wallet = db.relationship("Wallet", backref=db.backref("invitations", lazy="dynamic"))
    invited_user = db.relationship(
        "User", foreign_keys=[invited_user_id], backref=db.backref("wallet_invitations", lazy="dynamic")
    )
    invited_by_user = db.relationship(
        "User", foreign_keys=[invited_by_user_id], backref=db.backref("sent_wallet_invitations", lazy="dynamic")
    )

    def to_dict(self):
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "invited_user_id": self.invited_user_id,
            "invited_by_user_id": self.invited_by_user_id,
            "status": self.status,
            "responded_at": self.responded_at.isoformat() if self.responded_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    wallets = db.relationship(
        "Wallet", backref="owner", lazy=True, cascade="all, delete-orphan"
    )
    shared_wallets = db.relationship(
        "Wallet",
        secondary=WalletMember.__tablename__,
        backref=db.backref("members", lazy="dynamic"),
    )
    transactions = db.relationship("Transaction", backref="creator", lazy=True)
    ocr_jobs = db.relationship("OCRJob", backref="user", lazy=True)

    # Functions
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "profile_image_url": self.profile_image_url,
            "created_at": self.created_at.isoformat(),
        }


class Wallet(db.Model):
    __tablename__ = "wallets"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'personal' | 'group'
    owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    transactions = db.relationship(
        "Transaction", backref="wallet", lazy=True, cascade="all, delete-orphan"
    )

    # Functions
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    wallet_id = db.Column(db.String(36), db.ForeignKey("wallets.id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), default="HUF")
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    merchant_name = db.Column(db.String(100), nullable=True)

    # OCR specific fields
    original_image_url = db.Column(db.String(255), nullable=True)
    ocr_raw_text = db.Column(db.Text, nullable=True)

    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Functions
    def to_dict(self):
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "amount": float(self.amount),
            "currency": self.currency,
            "category": self.category,
            "date": self.date.isoformat(),
            "description": self.description,
            "merchant_name": self.merchant_name,
            "original_image_url": self.original_image_url,
            "ocr_raw_text": self.ocr_raw_text,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat(),
        }


class OCRJob(db.Model):
    __tablename__ = "ocr_jobs"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, processing, completed, failed
    raw_text = db.Column(db.Text, nullable=True)
    extracted_data = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Functions
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_path": self.image_path,
            "status": self.status,
            "raw_text": self.raw_text,
            "extracted_data": self.extracted_data,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat()
            if self.completed_at
            else None,
        }
