import os
import json
import re
from typing import Dict

from groq import Groq


class GroqParser:
    MODEL = 'llama-3.1-8b-instant'

    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError('GROQ_API_KEY must be set')
        self.client = Groq(api_key=api_key)

    def parse(self, ocr_text: str) -> Dict:
        truncated = ocr_text[:3000]  # stay within token limits

        prompt = (
            'Extract the following from this receipt text as valid JSON:\n'
            '- merchant (string)\n'
            '- total_amount (number)\n'
            '- date (string, YYYY-MM-DD)\n'
            '- items (array of {name, price})\n'
            '- tax_amount (number)\n'
            '- currency (string)\n'
            'Use null for missing fields. Return ONLY valid JSON.\n\n'
            f'Receipt:\n{truncated}\n\nJSON:'
        )

        raw = ''
        try:
            response = self.client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a precise data extraction assistant. Return only valid JSON.',
                    },
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.1,
                max_tokens=500,
            )
            raw = response.choices[0].message.content.strip()

            match = re.search(r'\{.*\}', raw, re.DOTALL)
            parsed = json.loads(match.group() if match else raw)
            return {'success': True, 'data': parsed}

        except json.JSONDecodeError as e:
            return {'success': False, 'error': f'JSON parse failed: {e}', 'raw_response': raw}
        except Exception as e:
            return {'success': False, 'error': str(e)}