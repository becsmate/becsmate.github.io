import requests
import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

class OCRSpaceService:
    def __init__(self):
        # self.api_key = os.getenv('OCR_SPACE_API_KEY', 'K82072529888957')
        self.api_key = os.getenv('OCR_API_KEY')
        self.api_url = 'https://api.ocr.space/parse/image'
    
    def extract_text_from_file(self, file_path: str) -> Dict:
        """Extract text from image file"""
        try:
            with open(file_path, 'rb') as file:
                files = {'file': file}
                data = {
                    'apikey': self.api_key,
                    'language': 'hun',
                    'isOverlayRequired': False,
                    'isTable': True,
                    'OCREngine': 1
                }
                
                response = requests.post(
                    self.api_url,
                    files=files,
                    data=data,
                    timeout=30
                )
                
            return self._parse_response(response.json())
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': ''
            }
    
    def extract_text_from_base64(self, base64_image: str) -> Dict:
        """Extract text from base64 image"""
        try:
            if ',' in base64_image:
                base64_image = base64_image.split(',', 1)[1]
            
            data = {
                'apikey': self.api_key,
                'base64Image': base64_image,
                'language': 'eng',
                'isOverlayRequired': False,
                'OCREngine': 2
            }
            
            response = requests.post(
                self.api_url,
                data=data,
                timeout=30
            )
            
            return self._parse_response(response.json())
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': ''
            }
    
    def _parse_response(self, response_data: Dict) -> Dict:
        """Parse OCR.space response"""
        if not response_data.get('ParsedResults'):
            error_msg = response_data.get('ErrorMessage', 'No text detected')
            return {
                'success': False,
                'error': error_msg,
                'text': ''
            }
        
        parsed_result = response_data['ParsedResults'][0]
        
        if parsed_result.get('ErrorMessage'):
            return {
                'success': False,
                'error': parsed_result['ErrorMessage'],
                'text': ''
            }
        
        return {
            'success': True,
            'text': parsed_result.get('ParsedText', ''),
            'raw_response': response_data,
            'error': None
        }