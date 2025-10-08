import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

class GroqAIParser:
    def __init__(self):
        load_dotenv()
        self.client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        self.model = "llama-3.1-8b-instant"
    
    def parse_receipt_with_ai(self, ocr_text: str) -> dict:
        """Use Groq + Llama 3 to parse receipt data"""
        
        prompt = f"""
        Extract the following information from this receipt text in valid JSON format:
        - merchant (string): The store or business name
        - total_amount (number): The total amount paid
        - date (string): The transaction date in YYYY-MM-DD format
        - items (array of objects): Each with 'name' and 'price'
        - tax_amount (number): The tax amount if visible
        - currency (string): The currency used

        Rules:
        - If a field cannot be found, use null
        - Convert all amounts to numbers
        - Dates should be in YYYY-MM-DD format
        - Return ONLY valid JSON, no other text

        Receipt text:
        {ocr_text[:3000]}  # Limit length

        JSON:
        """

        result_text = ""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a precise data extraction assistant. Always return valid JSON without any additional text or explanations."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Clean the response
            result_text = re.sub(r'^```json\s*|\s*```$', '', result_text)
            
            parsed_data = json.loads(result_text)
            return {
                'success': True,
                'data': parsed_data,
                'model_used': 'groq-llama3'
            }
            
        except json.JSONDecodeError as e:
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                try:
                    parsed_data = json.loads(json_match.group())
                    return {
                        'success': True,
                        'data': parsed_data,
                        'model_used': 'groq-llama3',
                        'warning': 'JSON was cleaned from response'
                    }
                except:
                    pass
            
            return {
                'success': False,
                'error': f'Failed to parse AI response: {str(e)}',
                'raw_response': result_text
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'AI processing failed: {str(e)}'
            }

# Usage
groq_parser = GroqAIParser()