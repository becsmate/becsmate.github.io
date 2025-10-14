# azure_receipt_service.py
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import os
from typing import Dict, List, Optional

class AzureReceiptService:
    def __init__(self):
        self.endpoint = os.getenv('AZURE_FORM_RECOGNIZER_ENDPOINT')
        self.key = os.getenv('AZURE_FORM_RECOGNIZER_KEY')
        self.client = DocumentAnalysisClient(
            endpoint=self.endpoint, 
            credential=AzureKeyCredential(self.key)
        )
    
    def analyze_receipt(self, file_path: str) -> Dict:
        """Extract structured receipt data using Azure's pre-built model"""
        try:
            with open(file_path, "rb") as file:
                poller = self.client.begin_analyze_document(
                    "prebuilt-receipt",  # Azure's pre-trained receipt model
                    file
                )
                result = poller.result()
            
            return self._parse_receipt_result(result)
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Azure Form Recognizer error: {str(e)}',
                'provider': 'azure-form-recognizer'
            }
    
    def _parse_receipt_result(self, result) -> Dict:
        """Parse Azure's receipt analysis into structured data"""
        
        if not result.documents:
            return {
                'success': False,
                'error': 'No receipt data found in document',
                'provider': 'azure-form-recognizer'
            }
        
        receipt = result.documents[0]
        fields = receipt.fields
        
        # Extract all available fields with proper typing
        extracted_data = {
            'merchant_name': self._get_field_value(fields, "MerchantName"),
            'merchant_address': self._get_field_value(fields, "MerchantAddress"),
            'merchant_phone': self._get_field_value(fields, "MerchantPhoneNumber"),
            'transaction_date': self._get_field_value(fields, "TransactionDate"),
            'transaction_time': self._get_field_value(fields, "TransactionTime"),
            'total': self._get_field_value(fields, "Total", field_type='amount'),
            'subtotal': self._get_field_value(fields, "Subtotal", field_type='amount'),
            'tax': self._get_field_value(fields, "TotalTax", field_type='amount'),
            'tip': self._get_field_value(fields, "Tip", field_type='amount'),
            'currency': self._get_field_value(fields, "Currency"),
            'items': self._extract_items(fields.get("Items")),
            'raw_confidence_scores': self._get_confidence_scores(fields)
        }
        
        # Calculate overall confidence
        confidence = self._calculate_overall_confidence(extracted_data['raw_confidence_scores'])
        
        return {
            'success': True,
            'data': extracted_data,
            'confidence': confidence,
            'provider': 'azure-form-recognizer',
            'model_used': 'prebuilt-receipt'
        }
    
    def _get_field_value(self, fields, field_name: str, field_type: str = 'text'):
        """Extract field value with proper type handling"""
        field = fields.get(field_name)
        if not field:
            return None
        
        if field_type == 'amount' and field.value:
            return float(field.value)
        elif field_type == 'date' and field.value:
            return field.value.isoformat()
        else:
            return field.value
    
    def _extract_items(self, items_field) -> List[Dict]:
        """Extract line items from receipt"""
        if not items_field or not items_field.value:
            return []
        
        items = []
        for item in items_field.value:
            item_data = {}
            for field_name, field in item.value.items():
                if field_name == "TotalPrice" and field.value:
                    item_data['total_price'] = float(field.value)
                elif field_name == "Quantity" and field.value:
                    item_data['quantity'] = float(field.value)
                elif field_name == "Price" and field.value:
                    item_data['unit_price'] = float(field.value)
                else:
                    item_data[field_name.lower()] = field.value
            
            items.append(item_data)
        
        return items
    
    def _get_confidence_scores(self, fields) -> Dict:
        """Extract confidence scores for each field"""
        confidence_scores = {}
        for field_name, field in fields.items():
            if hasattr(field, 'confidence') and field.confidence:
                confidence_scores[field_name] = field.confidence
        return confidence_scores
    
    def _calculate_overall_confidence(self, confidence_scores: Dict) -> float:
        """Calculate overall confidence score"""
        if not confidence_scores:
            return 0.0
        
        scores = list(confidence_scores.values())
        return sum(scores) / len(scores)