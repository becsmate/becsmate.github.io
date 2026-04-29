import os
import requests
from typing import Dict


class OCRSpaceService:
    API_URL = 'https://api.ocr.space/parse/image'

    def __init__(self):
        self.api_key = os.getenv('OCR_API_KEY')

    def extract_text(self, file_path: str) -> Dict:
        try:
            with open(file_path, 'rb') as f:
                response = requests.post(
                    self.API_URL,
                    files={'file': f},
                    data={
                        'apikey': self.api_key,
                        'language': 'hun',
                        'isOverlayRequired': False,
                        'isTable': True,
                        'OCREngine': 1,
                    },
                    timeout=30,
                )
            return self._parse_response(response.json())
        except Exception as e:
            # retry with OCR Engine 3 if Engine 1 fails (the best engine ocr.space provides)
            try:
                with open(file_path, 'rb') as f:
                    response = requests.post(
                        self.API_URL,
                        files={'file': f},
                        data={
                            'apikey': self.api_key,
                            'language': 'hun',
                            'isOverlayRequired': False,
                            'isTable': True,
                            'OCREngine': 3,
                        },
                        timeout=30,
                    )
                return self._parse_response(response.json())
            except Exception as e:
                return {'success': False, 'error': str(e), 'text': ''}

    def _parse_response(self, data: Dict) -> Dict:
        if not data.get('ParsedResults'):
            return {
                'success': False,
                'error': data.get('ErrorMessage', 'No text detected'),
                'text': '',
            }
        result = data['ParsedResults'][0]
        if result.get('ErrorMessage'):
            return {'success': False, 'error': result['ErrorMessage'], 'text': ''}
        return {'success': True, 'text': result.get('ParsedText', ''), 'error': None}