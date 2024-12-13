"""This script serves as a skeleton template for synchronous AgentQL scripts."""

import logging
import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional, List
import json
from datetime import datetime
import re
import os
from urllib.parse import quote_plus
import time
from random import randint

class WebScrapingAgent:
    def __init__(self, save_dir: str = "scraped_data"):
        """
        Inicializa o agente de web scraping.
        
        Args:
            save_dir: Diretório para salvar os dados extraídos
        """
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        }
        
        # Configuração de logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        
        # Cria diretório para salvar dados
        self.save_dir = save_dir
        os.makedirs(save_dir, exist_ok=True)
        
    def _make_request(self, url: str, retries: int = 3, delay: int = 2) -> Optional[requests.Response]:
        """
        Faz uma requisição HTTP com retry e delay.
        
        Args:
            url: URL para fazer a requisição
            retries: Número de tentativas
            delay: Tempo de espera entre tentativas
        
        Returns:
            Response object ou None em caso de falha
        """
        for attempt in range(retries):
            try:
                # Adiciona um delay aleatório para evitar bloqueios
                time.sleep(randint(1, delay))
                
                response = requests.get(url, headers=self.headers, timeout=10)
                response.raise_for_status()
                return response
                
            except requests.RequestException as e:
                self.logger.warning(f"Tentativa {attempt + 1} falhou: {str(e)}")
                if attempt == retries - 1:
                    self.logger.error(f"Todas as tentativas falharam para URL: {url}")
                    return None
        
        return None
        
    def _save_to_json(self, data: Dict, prefix: str = "scraping") -> str:
        """
        Salva os dados em um arquivo JSON.
        
        Args:
            data: Dados para salvar
            prefix: Prefixo do nome do arquivo
        
        Returns:
            Caminho do arquivo salvo
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.save_dir, f"{prefix}_{timestamp}.json")
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            self.logger.info(f"Dados salvos em: {filename}")
            return filename
        except Exception as e:
            self.logger.error(f"Erro ao salvar arquivo: {str(e)}")
            return ""

    def search_google(self, query: str, num_results: int = 10) -> Optional[Dict]:
        """
        Realiza uma busca no Google e retorna os resultados.
        
        Args:
            query: Termo de busca
            num_results: Número máximo de resultados
        
        Returns:
            Dicionário com os resultados ou None em caso de falha
        """
        self.logger.info(f"Iniciando busca por: {query}")
        
        try:
            url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"
            response = self._make_request(url)
            
            if not response:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            for result in soup.select('div.g'):
                title = result.select_one('h3')
                link = result.select_one('a')
                snippet = result.select_one('div.VwiC3b')
                
                if title and link:
                    results.append({
                        'title': title.text.strip(),
                        'link': link.get('href', ''),
                        'snippet': snippet.text.strip() if snippet else ''
                    })

            data = {
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'results': results[:num_results]
            }

            self._save_to_json(data, f"google_search_{query.replace(' ', '_')}")
            self.logger.info(f"Encontrados {len(results)} resultados")
            return data

        except Exception as e:
            self.logger.error(f"Erro na busca: {str(e)}")
            return None

    def get_currency_rate(self, currency: str = "dolar") -> Optional[Dict]:
        """
        Obtém a cotação atual da moeda especificada.
        
        Args:
            currency: Nome da moeda (ex: dolar, euro)
        
        Returns:
            Dicionário com a cotação ou None em caso de falha
        """
        self.logger.info(f"Buscando cotação do {currency}")
        
        try:
            url = f"https://www.google.com/search?q=cotacao+{quote_plus(currency)}+hoje"
            response = self._make_request(url)
            
            if not response:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Tenta diferentes seletores para maior robustez
            rate_div = (
                soup.select_one("div.BNeawe.iBp4i.AP7Wnd") or
                soup.select_one("div.dDoNo.ikb4Bb.gsrt") or
                soup.select_one("span.DFlfde.SwHCTb")
            )
            
            if rate_div:
                rate_text = rate_div.text
                rate = re.search(r'R?\$?\s*(\d+[,.]\d+)', rate_text)
                if rate:
                    data = {
                        'currency': currency,
                        'rate': rate.group(1),
                        'timestamp': datetime.now().isoformat()
                    }
                    self._save_to_json(data, f"currency_{currency}")
                    self.logger.info(f"Cotação obtida: R$ {rate.group(1)}")
                    return data

            self.logger.warning("Não foi possível encontrar a cotação")
            return None

        except Exception as e:
            self.logger.error(f"Erro ao obter cotação: {str(e)}")
            return None

    def get_weather(self, city: str = "São Paulo") -> Optional[Dict]:
        """
        Obtém a previsão do tempo para a cidade especificada.
        
        Args:
            city: Nome da cidade
        
        Returns:
            Dicionário com informações do clima ou None em caso de falha
        """
        self.logger.info(f"Buscando temperatura em {city}")
        
        try:
            url = f"https://www.google.com/search?q=temperatura+{quote_plus(city)}+hoje"
            response = self._make_request(url)
            
            if not response:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Tenta diferentes seletores para maior robustez
            temp = (
                soup.select_one("span#wob_tm") or
                soup.select_one("div.BNeawe.iBp4i.AP7Wnd")
            )
            
            condition = (
                soup.select_one("div.VQF4g") or
                soup.select_one("span#wob_dc")
            )
            
            if temp:
                data = {
                    'city': city,
                    'temperature': f"{temp.text.strip()}°C",
                    'condition': condition.text.strip() if condition else 'N/A',
                    'timestamp': datetime.now().isoformat()
                }
                self._save_to_json(data, f"weather_{city.replace(' ', '_')}")
                self.logger.info(f"Temperatura: {data['temperature']}, Condição: {data['condition']}")
                return data

            self.logger.warning("Não foi possível encontrar a temperatura")
            return None

        except Exception as e:
            self.logger.error(f"Erro ao obter previsão do tempo: {str(e)}")
            return None


def main():
    # Exemplo de uso
    agent = WebScrapingAgent(save_dir="dados_extraidos")
    
    # Busca cotação do dólar
    print("\nBuscando cotação do dólar...")
    dollar_rate = agent.get_currency_rate("dolar")
    if dollar_rate:
        print(f"Cotação do dólar: R$ {dollar_rate['rate']}")
    
    # Busca temperatura
    print("\nBuscando temperatura em São Paulo...")
    weather = agent.get_weather("São Paulo")
    if weather:
        print(f"Temperatura em {weather['city']}: {weather['temperature']}")
        print(f"Condição: {weather['condition']}")
    
    # Realiza uma busca no Google
    print("\nRealizando busca no Google...")
    search_results = agent.search_google("python programming", num_results=5)
    if search_results:
        print(f"Encontrados {len(search_results['results'])} resultados")
        for i, result in enumerate(search_results['results'], 1):
            print(f"\n{i}. {result['title']}")
            print(f"   Link: {result['link']}")


def get_response():
    query = """
{
  pokemon[] {
    name
    id
    type
  }
}
    """

    url = "https://graphql-pokemon2.vercel.app/"
    response = requests.post(url, json={"query": query})

    # For more details on how to consume the response, refer to the documentation at https://docs.agentql.com/intro/main-concepts
    print(response.json())


if __name__ == "__main__":
    main()
    get_response()
