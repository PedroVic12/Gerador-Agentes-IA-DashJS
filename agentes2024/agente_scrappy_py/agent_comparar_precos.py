"""
Agente de comparação de preços que utiliza Selenium e BeautifulSoup
para extrair e comparar preços de produtos em diferentes sites de e-commerce.
"""

import json
from datetime import datetime
import os
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass
from urllib.parse import quote_plus
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import time

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ProductInfo:
    """Classe para armazenar informações do produto."""
    name: str
    price: float
    store: str
    url: str
    timestamp: str
    currency: str = "BRL"
    available: bool = True
    additional_info: Dict = None


def pesquisarPlaywright(driver, query, max_results=5):
    # Formata a URL de busca
    url = f"https://www.mercadolivre.com.br/jm/search?as_word={quote_plus(query)}"
    driver.get(url)
    time.sleep(2)  # Pequena pausa para carregar o conteúdo dinâmico

    # Espera os resultados carregarem
    driver.find_element(By.CLASS_NAME, "ui-search-layout__item")

    # Obtém o HTML e cria o objeto BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Encontra todos os itens de produto
    items = soup.select('[data-item-id]')[:max_results]

    return items

def extrairInformacoes(item, driver):
    # Extrai o nome do produto
    name = item.select_one('[data-item-id] .ui-search-item__title').text.strip()

    # Extrai o preço do produto
    price = item.select_one('[data-item-id] .ui-search-price__second-line').text.strip()

    # Extrai a loja do produto
    store = item.select_one('[data-item-id] .ui-search-item__group--buy').text.strip()

    # Extrai a URL do produto
    url = item.select_one('[data-item-id] a').get('href')

    # Cria o objeto ProductInfo
    product_info = ProductInfo(name=name, price=price, store=store, url=url, timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    return product_info




class PriceScraperAgent:
    """Agente para comparação de preços em diferentes e-commerce."""
    
    def __init__(self, headless: bool = True, save_dir: str = "price_data"):
        """
        Inicializa o agente de scraping de preços.
        
        Args:
            headless: Se True, executa o navegador em modo headless
            save_dir: Diretório para salvar os dados extraídos
        """
        self.save_dir = save_dir
        os.makedirs(save_dir, exist_ok=True)
        
        # Configuração do Selenium
        self.options = webdriver.ChromeOptions()
        if headless:
            self.options.add_argument("--headless")
        self.options.add_argument("--no-sandbox")
        self.options.add_argument("--disable-dev-shm-usage")
        self.options.add_argument("--disable-gpu")
        self.options.add_argument("--window-size=1920,1080")
        
        # User agent para parecer mais com um navegador real
        self.options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    def _get_driver(self):
        """Cria e retorna uma nova instância do webdriver."""
        return webdriver.Chrome(options=self.options)
    
    def _save_to_json(self, data: Dict, prefix: str = "price_data") -> str:
        """Salva os dados em um arquivo JSON."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(self.save_dir, f"{prefix}_{timestamp}.json")
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            logger.info(f"Dados salvos em: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Erro ao salvar arquivo: {str(e)}")
            return ""
    
    def _extract_price(self, text: str) -> float:
        """Extrai o valor numérico de um texto contendo preço."""
        try:
            price_text = re.sub(r'[^\d.,]', '', text)
            price_text = price_text.replace(',', '.')
            return float(price_text)
        except ValueError:
            return 0.0
    
    def _wait_and_get_element(self, driver, by, value, timeout=10):
        """Espera e retorna um elemento quando disponível."""
        try:
            element = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            logger.warning(f"Timeout esperando por elemento: {value}")
            return None
    
    def search_mercadolivre(self, query: str, max_results: int = 5) -> List[ProductInfo]:
        """
        Busca produtos no Mercado Livre.
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados
        
        Returns:
            Lista de ProductInfo com os resultados encontrados
        """
        results = []
        driver = self._get_driver()
        
        try:
            # Formata a URL de busca
            url = f"https://www.mercadolivre.com.br/jm/search?as_word={quote_plus(query)}"
            logger.info(f"Buscando em Mercado Livre: {query}")
            
            # Acessa a página
            driver.get(url)
            time.sleep(2)  # Pequena pausa para carregar o conteúdo dinâmico
            
            # Espera os resultados carregarem
            self._wait_and_get_element(driver, By.CLASS_NAME, "ui-search-layout__item")
            
            # Obtém o HTML e cria o objeto BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Encontra todos os itens de produto
            items = soup.select(".ui-search-layout__item")[:max_results]
            
            for item in items:
                try:
                    # Extrai informações do produto
                    name_elem = item.select_one(".ui-search-item__title")
                    price_elem = item.select_one(".price-tag-amount")
                    link_elem = item.select_one(".ui-search-link")
                    
                    if name_elem and price_elem and link_elem:
                        name = name_elem.text.strip()
                        price = self._extract_price(price_elem.text)
                        url = link_elem['href']
                        
                        product = ProductInfo(
                            name=name,
                            price=price,
                            store="Mercado Livre",
                            url=url,
                            timestamp=datetime.now().isoformat()
                        )
                        results.append(product)
                        logger.info(f"Produto encontrado: {name} - R$ {price:.2f}")
                
                except Exception as e:
                    logger.error(f"Erro ao processar item: {str(e)}")
                    continue
            
        except Exception as e:
            logger.error(f"Erro ao buscar no Mercado Livre: {str(e)}")
        
        finally:
            driver.quit()
        
        # Salva os resultados
        if results:
            data = {
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'results': [vars(r) for r in results]
            }
            self._save_to_json(data, f"mercadolivre_search_{query.replace(' ', '_')}")
        
        return results
    
    def search_magalu(self, query: str, max_results: int = 5) -> List[ProductInfo]:
        """
        Busca produtos no Magazine Luiza.
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados
        
        Returns:
            Lista de ProductInfo com os resultados encontrados
        """
        results = []
        driver = self._get_driver()
        
        try:
            url = f"https://www.magazineluiza.com.br/busca/{quote_plus(query)}"
            logger.info(f"Buscando em Magazine Luiza: {query}")
            
            driver.get(url)
            time.sleep(2)
            
            # Espera os produtos carregarem
            self._wait_and_get_element(driver, By.DATA_TESTID, "product-card")
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            items = soup.select('[data-testid="product-card"]')[:max_results]
            
            for item in items:
                try:
                    name_elem = item.select_one('[data-testid="product-title"]')
                    price_elem = item.select_one('[data-testid="price-value"]')
                    link_elem = item.select_one('a')
                    
                    if name_elem and price_elem and link_elem:
                        name = name_elem.text.strip()
                        price = self._extract_price(price_elem.text)
                        url = link_elem['href']
                        
                        product = ProductInfo(
                            name=name,
                            price=price,
                            store="Magazine Luiza",
                            url=url,
                            timestamp=datetime.now().isoformat()
                        )
                        results.append(product)
                        logger.info(f"Produto encontrado: {name} - R$ {price:.2f}")
                
                except Exception as e:
                    logger.error(f"Erro ao processar item: {str(e)}")
                    continue
            
        except Exception as e:
            logger.error(f"Erro ao buscar no Magazine Luiza: {str(e)}")
        
        finally:
            driver.quit()
        
        if results:
            data = {
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'results': [vars(r) for r in results]
            }
            self._save_to_json(data, f"magalu_search_{query.replace(' ', '_')}")
        
        return results
    
    def get_best_deals(self, query: str, max_results: int = 5) -> List[ProductInfo]:
        """
        Busca as melhores ofertas em diferentes lojas.
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados por loja
        
        Returns:
            Lista combinada de resultados ordenada por preço
        """
        all_results = []
        
        # Busca em diferentes lojas
        all_results.extend(self.search_mercadolivre(query, max_results))
        #all_results.extend(self.search_magalu(query, max_results))
        
        # Ordena por preço e remove produtos com preço zero
        valid_results = [r for r in all_results if r.price > 0]
        sorted_results = sorted(valid_results, key=lambda x: x.price)
        
        return sorted_results[:max_results]


def main():
    """Função principal para demonstração do agente."""
    # Cria uma instância do agente
    agent = PriceScraperAgent(headless=True, save_dir="dados_precos")
    
    # Exemplo de busca por um produto
    product_name = "smartphone samsung galaxy"
    print(f"\nBuscando: {product_name}")
    
    # Obtém as melhores ofertas
    best_deals = agent.get_best_deals(product_name, max_results=5)
    
    # Exibe os resultados
    print("\nMelhores ofertas encontradas:")
    for i, deal in enumerate(best_deals, 1):
        print(f"\n{i}. {deal.name}")
        print(f"   Preço: R$ {deal.price:.2f}")
        print(f"   Loja: {deal.store}")
        print(f"   URL: {deal.url}")


if __name__ == "__main__":
    main()