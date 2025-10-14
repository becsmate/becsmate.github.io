from typing import Dict
from .azure_receipt_service import AzureReceiptService
from .azure_ocr import AzureOCR
from .grok_parser import GroqAIParser
from .ocr_service import OCRSpaceService

class SmartReceiptService:
    def __init__(self):
        self.providers = []
        
        # Primary: OCR.Space + Groq AI
        try:
            self.providers.append(('ocr_space', {
                'ocr': OCRSpaceService(),
                'parser': GroqAIParser()
            }))
        except ImportError:
            pass

        # Fallback 1: Azure Computer Vision + Groq AI
        try:
            self.providers.append(('azure_vision', {
                'ocr': AzureOCR(),
                'parser': GroqAIParser()
            }))
        except ImportError:
            pass

        # Fallback 2: Azure Form Recognizer
        try:
            self.providers.append(('azure_form', AzureReceiptService()))
        except ImportError:
            pass
    
    def process_receipt(self, file_path: str) -> Dict:
        """Process receipt with automatic provider fallback"""
        
        for provider_name, provider in self.providers:
            print(f"🔧 Trying provider: {provider_name}")
            
            try:
                if provider_name == 'azure_form':
                    result = provider.analyze_receipt(file_path)
                    print(result)
                    if result['success']:
                        return result
                
                else:
                    ocr_result = provider['ocr'].extract_text_from_image(file_path)
                    if ocr_result['success']:
                        parsed_data = provider['parser'].parse_ocr_text(ocr_result['text'])
                        
                        return {
                            'success': True,
                            'ocr_text': ocr_result['text'],
                            'parsed_data': parsed_data,
                            'provider': provider_name,
                            'parser_used': 'custom'
                        }
                        
            except Exception as e:
                print(f"❌ Provider {provider_name} failed: {str(e)}")
                continue
        
        return {
            'success': False,
            'error': 'All receipt processing methods failed'
        }