"""This script serves as a skeleton template for synchronous AgentQL scripts."""

import logging
import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional
import json
from datetime import datetime
from playwright.sync_api import sync_playwright
import re
import agentql
from agentql.ext.playwright.sync_api import Page

# Set up logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# Set the URL to the desired website
URL = "https://scrapeme.live/product-category/pokemon/"

url_google = ""


class WebScrapingAgent:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    def _save_to_json(self, data: Dict, prefix: str = "scraping") -> str:
        """Salva os dados em um arquivo JSON."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{prefix}_{timestamp}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return filename

    def search_google(self, query: str) -> Optional[Dict]:
        """Realiza uma busca no Google e retorna os resultados."""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Acessa o Google e faz a pesquisa
                page.goto(f"https://www.google.com/search?q={query}")
                page.wait_for_selector("div#search")
                
                content = page.content()
                soup = BeautifulSoup(content, 'html.parser')
                browser.close()

                # Extrai os resultados
                results = []
                for result in soup.select('div.g'):
                    title = result.select_one('h3')
                    link = result.select_one('a')
                    snippet = result.select_one('div.VwiC3b')
                    
                    if title and link:
                        results.append({
                            'title': title.text,
                            'link': link.get('href'),
                            'snippet': snippet.text if snippet else ''
                        })

                data = {
                    'query': query,
                    'timestamp': datetime.now().isoformat(),
                    'results': results
                }

                # Salva os resultados
                self._save_to_json(data, f"google_search_{query.replace(' ', '_')}")
                return data

        except Exception as e:
            print(f"Erro na busca: {str(e)}")
            return None

    def get_currency_rate(self, currency: str = "dolar") -> Optional[Dict]:
        """Obtém a cotação atual da moeda especificada."""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Pesquisa a cotação no Google
                page.goto(f"https://www.google.com/search?q=cotacao+{currency}+hoje")
                page.wait_for_selector("div.BNeawe.iBp4i.AP7Wnd")
                
                content = page.content()
                soup = BeautifulSoup(content, 'html.parser')
                browser.close()

                # Extrai o valor da cotação
                rate_div = soup.select_one("div.BNeawe.iBp4i.AP7Wnd")
                if rate_div:
                    rate_text = rate_div.text
                    # Extrai o valor numérico
                    rate = re.search(r'R?\$?\s*(\d+[,.]\d+)', rate_text)
                    if rate:
                        data = {
                            'currency': currency,
                            'rate': rate.group(1),
                            'timestamp': datetime.now().isoformat()
                        }
                        self._save_to_json(data, f"currency_{currency}")
                        return data

        except Exception as e:
            print(f"Erro ao obter cotação: {str(e)}")
            return None

    def get_weather(self, city: str = "São Paulo") -> Optional[Dict]:
        """Obtém a previsão do tempo para a cidade especificada."""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Pesquisa o clima no Google
                page.goto(f"https://www.google.com/search?q=temperatura+{city}+hoje")
                page.wait_for_selector("div#wob_wc")
                
                content = page.content()
                soup = BeautifulSoup(content, 'html.parser')
                browser.close()

                # Extrai as informações do clima
                temp = soup.select_one("span#wob_tm")
                condition = soup.select_one("div.VQF4g")
                
                if temp and condition:
                    data = {
                        'city': city,
                        'temperature': f"{temp.text}°C",
                        'condition': condition.text,
                        'timestamp': datetime.now().isoformat()
                    }
                    self._save_to_json(data, f"weather_{city.replace(' ', '_')}")
                    return data

        except Exception as e:
            print(f"Erro ao obter previsão do tempo: {str(e)}")
            return None


def main():
    with sync_playwright() as p, p.chromium.launch(headless=False) as browser:
        # Create a new page in the browser and wrap it to get access to the AgentQL's querying API
        page = agentql.wrap(browser.new_page())

        # Navigate to the desired URL
        page.goto(URL)

        get_response(page)


def get_response(page: Page):
    query = """
{
  pokemon[] {
    name
    id
    type
  }
}
    """

    response = page.query_data(query)

    # For more details on how to consume the response, refer to the documentation at https://docs.agentql.com/intro/main-concepts
    print(response)


    # enviar get e post google sheet


    # recebe dados LLM gemini


    # reposta processamento de imagem e texto extraido gemini

    # repsosta em markdwon + excel dos os dados


if __name__ == "__main__":
    main()
