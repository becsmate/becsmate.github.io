# azure_ocr.py
import os
from dotenv import load_dotenv
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
import time

load_dotenv()

class AzureOCR:
    def __init__(self):
        self.subscription_key = os.getenv('AZURE_VISION_KEY')
        self.endpoint = os.getenv('AZURE_VISION_ENDPOINT')
        self.client = ComputerVisionClient(
            self.endpoint, 
            CognitiveServicesCredentials(self.subscription_key)
        )
    
    def extract_text_from_image(self, image_path: str) -> dict:
        """Extract text using Azure Computer Vision"""
        try:
            with open(image_path, "rb") as image_file:
                # For printed text recognition
                read_result = self.client.read_in_stream(
                    image_file, 
                    raw=True
                )
            
            # Get the operation location (async operation)
            operation_location = read_result.headers["Operation-Location"]
            operation_id = operation_location.split("/")[-1]
            
            # Wait for processing
            while True:
                result = self.client.get_read_result(operation_id)
                if result.status not in ['notStarted', 'running']:
                    break
                time.sleep(1)
            
            if result.status == OperationStatusCodes.succeeded:
                extracted_text = ""
                for page in result.analyze_result.read_results:
                    for line in page.lines:
                        extracted_text += line.text + "\n"
                
                return {
                    'success': True,
                    'text': extracted_text.strip(),
                    'provider': 'azure-computer-vision'
                }
            else:
                return {
                    'success': False,
                    'error': f'Azure OCR failed with status: {result.status}',
                    'provider': 'azure-computer-vision'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Azure OCR error: {str(e)}',
                'provider': 'azure-computer-vision'
            }

    def extract_text_quick(self, image_path: str) -> dict:
        """Simpler OCR (faster, less accurate)"""
        try:
            with open(image_path, "rb") as image_file:
                ocr_result = self.client.recognize_printed_text_in_stream(image_file)
            
            extracted_text = ""
            for region in ocr_result.regions:
                for line in region.lines:
                    for word in line.words:
                        extracted_text += word.text + " "
                    extracted_text += "\n"
            
            return {
                'success': True,
                'text': extracted_text.strip(),
                'provider': 'azure-ocr-quick'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Azure quick OCR error: {str(e)}'
            }