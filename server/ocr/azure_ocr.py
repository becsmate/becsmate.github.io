import os
import time
from typing import Dict

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials


class AzureOCR:
    def __init__(self):
        key = os.getenv('AZURE_VISION_KEY')
        endpoint = os.getenv('AZURE_VISION_ENDPOINT')
        if not key or not endpoint:
            raise ValueError('AZURE_VISION_KEY and AZURE_VISION_ENDPOINT must be set')
        self.client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(key))

    def extract_text(self, image_path: str) -> Dict:
        try:
            with open(image_path, 'rb') as f:
                read_result = self.client.read_in_stream(f, raw=True)

            operation_id = read_result.headers['Operation-Location'].split('/')[-1]

            while True:
                result = self.client.get_read_result(operation_id)
                if result.status not in ('notStarted', 'running'):
                    break
                time.sleep(1)

            if result.status == OperationStatusCodes.succeeded:
                text = '\n'.join(
                    line.text
                    for page in result.analyze_result.read_results
                    for line in page.lines
                )
                return {'success': True, 'text': text.strip()}

            return {'success': False, 'error': f'Azure OCR status: {result.status}', 'text': ''}

        except Exception as e:
            return {'success': False, 'error': str(e), 'text': ''}