import os
from typing import Dict, List

from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential


class AzureReceiptService:
    def __init__(self):
        endpoint = os.getenv('AZURE_FORM_RECOGNIZER_ENDPOINT')
        key = os.getenv('AZURE_FORM_RECOGNIZER_KEY')
        if not endpoint or not key:
            raise ValueError(
                'AZURE_FORM_RECOGNIZER_ENDPOINT and AZURE_FORM_RECOGNIZER_KEY must be set'
            )
        self.client = DocumentAnalysisClient(
            endpoint=endpoint, credential=AzureKeyCredential(key)
        )

    def analyze_receipt(self, file_path: str) -> Dict:
        try:
            with open(file_path, 'rb') as f:
                result = self.client.begin_analyze_document('prebuilt-receipt', f).result()
            return self._parse_result(result)
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _parse_result(self, result) -> Dict:
        if not result.documents:
            return {'success': False, 'error': 'No receipt found in document'}

        fields = result.documents[0].fields
        return {
            'success': True,
            'parsed_data': {
                'merchant': self._val(fields, 'MerchantName'),
                'total_amount': self._val(fields, 'Total', as_float=True),
                'tax_amount': self._val(fields, 'TotalTax', as_float=True),
                'date': self._val(fields, 'TransactionDate'),
                'currency': self._val(fields, 'Currency'),
                'items': self._extract_items(fields.get('Items')),
            },
            'provider': 'azure-form-recognizer',
        }

    def _val(self, fields, name: str, as_float: bool = False):
        field = fields.get(name)
        if not field or field.value is None:
            return None
        return float(field.value) if as_float else field.value

    def _extract_items(self, items_field) -> List[Dict]:
        if not items_field or not items_field.value:
            return []
        return [
            {
                'name': self._val(item.value or {}, 'Description'),
                'price': self._val(item.value or {}, 'TotalPrice', as_float=True),
                'quantity': self._val(item.value or {}, 'Quantity', as_float=True),
            }
            for item in items_field.value
        ]