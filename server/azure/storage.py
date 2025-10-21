# services/azure_storage.py
import os
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import ResourceExistsError
from datetime import datetime, timedelta
from PIL import Image
import io
import uuid
from typing import Optional

class AzureStorageService:
    def __init__(self):
        self.connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.account_name = self.connection_string.split('AccountName=')[1].split(';')[0]
        self.account_key = self.connection_string.split('AccountKey=')[1].split(';')[0]
        self.container_name = "user-profile-images"
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        self._ensure_container_exists()
    
    def _ensure_container_exists(self):
        """Create container if it doesn't exist (now private)"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            container_client.create_container()  # No public access - containers are private now
        except ResourceExistsError:
            # Container already exists
            pass
        except Exception as e:
            print(f"Container creation error: {str(e)}")
    
    def upload_profile_image(self, image_file, user_id: str, max_size: tuple = (400, 400)) -> Optional[str]:
        """Upload and resize profile image, return blob name (not URL)"""
        try:
            # Process image
            image = Image.open(image_file)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Resize image while maintaining aspect ratio
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
            img_byte_arr = img_byte_arr.getvalue()
            
            # Generate unique filename (this is what we'll store in DB)
            blob_name = f"{user_id}/profile_{uuid.uuid4().hex}.jpg"
            
            # Upload to blob storage
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            blob_client.upload_blob(img_byte_arr, overwrite=True)
            
            # Return blob name (not full URL) for database storage
            return blob_name
            
        except Exception as e:
            print(f"Error uploading profile image: {str(e)}")
            return None
    
    def generate_sas_url(self, blob_name: str, expiration_hours: int = 24) -> Optional[str]:
        """Generate a temporary SAS URL for accessing private blobs"""
        try:
            if not blob_name:
                return None
            
            # Generate SAS token
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=expiration_hours)
            )
            
            # Construct full URL with SAS token
            sas_url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
            
            return sas_url
            
        except Exception as e:
            print(f"Error generating SAS URL: {str(e)}")
            return None
    
    def get_user_profile_url(self, user_id: str, blob_name: str = None) -> Optional[str]:
        """Get SAS URL for user's profile image"""
        if not blob_name:
            # Try to find the latest profile image for user
            blob_name = self._find_latest_profile_image(user_id)
        
        if blob_name:
            return self.generate_sas_url(blob_name)
        return None
    
    def _find_latest_profile_image(self, user_id: str) -> Optional[str]:
        """Find the most recent profile image for a user"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            blobs = list(container_client.list_blobs(name_starts_with=f"{user_id}/"))
            
            if blobs:
                # Return the first one (or implement more sophisticated logic)
                return blobs[0].name
            return None
            
        except Exception as e:
            print(f"Error finding profile image: {str(e)}")
            return None
    
    def delete_profile_image(self, blob_name: str) -> bool:
        """Delete profile image using blob name"""
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            blob_client.delete_blob()
            return True
            
        except Exception as e:
            print(f"Error deleting profile image: {str(e)}")
            return False