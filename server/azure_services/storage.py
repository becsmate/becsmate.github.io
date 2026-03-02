import io
import uuid
from datetime import datetime, timedelta
from typing import Optional

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import ResourceExistsError
from PIL import Image


class AzureStorageService:
    CONTAINER = 'user-profile-images'
    MAX_SIZE = (400, 400)

    def __init__(self, connection_string: str):
        if not connection_string:
            raise ValueError('Azure storage connection string is required')
        self.account_name = connection_string.split('AccountName=')[1].split(';')[0]
        self.account_key = connection_string.split('AccountKey=')[1].split(';')[0]
        self.client = BlobServiceClient.from_connection_string(connection_string)
        self._ensure_container()

    def _ensure_container(self):
        try:
            self.client.get_container_client(self.CONTAINER).create_container()
        except ResourceExistsError:
            pass

    def upload_profile_image(self, image_stream, user_id: int) -> str:
        img = Image.open(image_stream)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail(self.MAX_SIZE, Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=85, optimize=True)

        blob_name = f'{user_id}/profile_{uuid.uuid4().hex}.jpg'
        self.client.get_blob_client(
            container=self.CONTAINER, blob=blob_name
        ).upload_blob(buf.getvalue(), overwrite=True)

        return self._sas_url(blob_name)

    def _sas_url(self, blob_name: str, hours: int = 24) -> str:
        token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.CONTAINER,
            blob_name=blob_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=hours),
        )
        return (
            f'https://{self.account_name}.blob.core.windows.net'
            f'/{self.CONTAINER}/{blob_name}?{token}'
        )