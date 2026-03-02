from typing import Dict


class SmartReceiptService:
    def __init__(self):
        self.providers = []

        # Primary: OCR.space + Groq
        try:
            from ocr.ocr_service import OCRSpaceService
            from ocr.groq_parser import GroqParser
            self.providers.append(('ocr_space', {'ocr': OCRSpaceService(), 'parser': GroqParser()}))
        except Exception as e:
            print(f'OCR.space provider unavailable: {e}')

        # Fallback 1: Azure Computer Vision + Groq
        try:
            from ocr.azure_ocr import AzureOCR
            from ocr.groq_parser import GroqParser
            self.providers.append(('azure_vision', {'ocr': AzureOCR(), 'parser': GroqParser()}))
        except Exception as e:
            print(f'Azure Vision provider unavailable: {e}')

        # Fallback 2: Azure Form Recognizer (structured output, no Groq needed)
        try:
            from ocr.azure_receipt_service import AzureReceiptService
            self.providers.append(('azure_form', AzureReceiptService()))
        except Exception as e:
            print(f'Azure Form Recognizer unavailable: {e}')

    def process(self, file_path: str) -> Dict:
        for name, provider in self.providers:
            print(f'Trying OCR provider: {name}')
            try:
                if name == 'azure_form':
                    result = provider.analyze_receipt(file_path)
                    if result['success']:
                        return result
                else:
                    ocr_result = provider['ocr'].extract_text(file_path)
                    if ocr_result['success']:
                        parsed = provider['parser'].parse(ocr_result['text'])
                        return {
                            'success': True,
                            'ocr_text': ocr_result['text'],
                            'parsed_data': parsed.get('data'),
                            'provider': name,
                        }
            except Exception as e:
                print(f'Provider {name} failed: {e}')
                continue

        return {'success': False, 'error': 'All OCR providers failed'}