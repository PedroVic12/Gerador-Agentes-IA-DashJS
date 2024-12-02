"""
Agente de comparação de preços que combina AgentQL, Playwright e BeautifulSoup
para extrair e comparar preços de produtos em diferentes sites de e-commerce.
"""

import agentql
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os
from typing import Dict, List, Optional, Union
import logging
from dataclasses import dataclass
from urllib.parse import quote_plus
import re
from selenium import webdriver

# Configuração de logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# URL de exemplo
URL = "https://www.mercadolivre.com.br/jm/search?as_word=smartphone"


def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Executa em modo headless
    return webdriver.Chrome(options=options)



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

class PriceComparisonAgent:
    """Agente para comparação de preços em diferentes e-commerce."""
    
    def __init__(self, headless: bool = True, save_dir: str = "price_data"):
        """
        Inicializa o agente de comparação de preços.
        
        Args:
            headless: Se True, executa o navegador em modo headless
            save_dir: Diretório para salvar os dados extraídos
        """
        self.headless = headless
        self.save_dir = save_dir
        os.makedirs(save_dir, exist_ok=True)
        
        # Configuração de logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            
        # Headers para requisições
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        }
        
        # Queries GraphQL para diferentes sites
        self.queries = {
            'amazon': """
                {
                    product {
                        name
                        price(currency: BRL)
                        availability
                    }
                }
            """,
            'mercadolivre': """
                {
                    item {
                        title
                        price
                        condition
                        stock
                    }
                }
            """,
            'magalu': """
                {
                    product {
                        name
                        price
                        installments
                        availability
                    }
                }
            """
        }
    
    def _save_to_json(self, data: Dict, prefix: str = "price_data") -> str:
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
    
    def _extract_price(self, text: str) -> float:
        """
        Extrai o valor numérico de um texto contendo preço.
        
        Args:
            text: Texto contendo o preço
            
        Returns:
            Valor do preço como float
        """
        try:
            # Remove caracteres não numéricos exceto ponto e vírgula
            price_text = re.sub(r'[^\d.,]', '', text)
            # Substitui vírgula por ponto
            price_text = price_text.replace(',', '.')
            # Converte para float
            return float(price_text)
        except ValueError:
            return 0.0
    
    def search_product(self, product_name: str, max_results: int = 5) -> List[ProductInfo]:
        """
        Busca um produto em diferentes e-commerces.
        
        Args:
            product_name: Nome do produto para buscar
            max_results: Número máximo de resultados por site
            
        Returns:
            Lista de ProductInfo com os resultados encontrados
        """
        results = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            
            try:
                # Configuração da página
                page = agentql.wrap(browser.new_page())
                page.set_default_timeout(30000)
                
                # Lista de sites para buscar
                sites = {
                    'mercadolivre': f'https://www.mercadolivre.com.br/jm/search?as_word={quote_plus(product_name)}',
                    'magalu': f'https://www.magazineluiza.com.br/busca/{quote_plus(product_name)}',
                    'amazon': f'https://www.amazon.com.br/s?k={quote_plus(product_name)}'
                }
                
                for store, url in sites.items():
                    self.logger.info(f"Buscando em {store}: {product_name}")
                    
                    try:
                        # Navega para a página
                        page.goto(url)
                        page.wait_for_load_state('networkidle')
                        
                        # Usa AgentQL para extrair dados
                        response = page.query_data(self.queries[store])
                        
                        # Usa BeautifulSoup como fallback
                        if not response:
                            html = page.content()
                            soup = BeautifulSoup(html, 'html.parser')
                            
                            # Extrai dados com base no site
                            if store == 'mercadolivre':
                                items = soup.select('div.ui-search-result__content-wrapper')[:max_results]
                                for item in items:
                                    name = item.select_one('.ui-search-item__title')
                                    price = item.select_one('.price-tag-amount')
                                    link = item.select_one('a.ui-search-link')
                                    
                                    if name and price and link:
                                        results.append(ProductInfo(
                                            name=name.text.strip(),
                                            price=self._extract_price(price.text),
                                            store=store,
                                            url=link['href'],
                                            timestamp=datetime.now().isoformat()
                                        ))
                            
                            elif store == 'magalu':
                                items = soup.select('div[data-testid="product-card"]')[:max_results]
                                for item in items:
                                    name = item.select_one('[data-testid="product-title"]')
                                    price = item.select_one('[data-testid="price-value"]')
                                    link = item.select_one('a')
                                    
                                    if name and price and link:
                                        results.append(ProductInfo(
                                            name=name.text.strip(),
                                            price=self._extract_price(price.text),
                                            store=store,
                                            url=link['href'],
                                            timestamp=datetime.now().isoformat()
                                        ))
                            
                            elif store == 'amazon':
                                items = soup.select('div[data-component-type="s-search-result"]')[:max_results]
                                for item in items:
                                    name = item.select_one('h2 span')
                                    price = item.select_one('.a-price-whole')
                                    link = item.select_one('h2 a')
                                    
                                    if name and price and link:
                                        results.append(ProductInfo(
                                            name=name.text.strip(),
                                            price=self._extract_price(price.text),
                                            store=store,
                                            url='https://www.amazon.com.br' + link['href'],
                                            timestamp=datetime.now().isoformat()
                                        ))
                    
                    except Exception as e:
                        self.logger.error(f"Erro ao buscar em {store}: {str(e)}")
                        continue
                
            finally:
                browser.close()
        
        # Salva os resultados
        if results:
            data = {
                'query': product_name,
                'timestamp': datetime.now().isoformat(),
                'results': [vars(r) for r in results]
            }
            self._save_to_json(data, f"search_{product_name.replace(' ', '_')}")
        
        return results
    
    def get_best_deals(self, product_name: str, max_results: int = 5) -> List[ProductInfo]:
        """
        Retorna as melhores ofertas para um produto.
        
        Args:
            product_name: Nome do produto
            max_results: Número máximo de resultados
            
        Returns:
            Lista de ProductInfo ordenada por preço
        """
        results = self.search_product(product_name, max_results)
        return sorted(results, key=lambda x: x.price)[:max_results]
    
    def monitor_price(self, url: str) -> Optional[ProductInfo]:
        """
        Monitora o preço de um produto específico.
        
        Args:
            url: URL do produto
            
        Returns:
            ProductInfo com as informações atualizadas do produto
        """
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            
            try:
                page = agentql.wrap(browser.new_page())
                page.goto(url)
                page.wait_for_load_state('networkidle')
                
                # Tenta extrair informações com base no domínio
                domain = re.search(r'https?://(?:www\.)?([^/]+)', url).group(1)
                
                if 'mercadolivre' in domain:
                    name = page.query_selector('.ui-pdp-title').text_content()
                    price = page.query_selector('.andes-money-amount__fraction').text_content()
                elif 'magazineluiza' in domain:
                    name = page.query_selector('[data-testid="heading-product-title"]').text_content()
                    price = page.query_selector('[data-testid="price-value"]').text_content()
                elif 'amazon' in domain:
                    name = page.query_selector('#productTitle').text_content()
                    price = page.query_selector('.a-price-whole').text_content()
                else:
                    self.logger.error(f"Site não suportado: {domain}")
                    return None
                
                return ProductInfo(
                    name=name.strip(),
                    price=self._extract_price(price),
                    store=domain,
                    url=url,
                    timestamp=datetime.now().isoformat()
                )
            
            except Exception as e:
                self.logger.error(f"Erro ao monitorar preço: {str(e)}")
                return None
            
            finally:
                browser.close()


def main():
    """Função principal para demonstração do agente."""
    # Cria uma instância do agente
    agent = PriceComparisonAgent(headless=False, save_dir="dados_precos")
    
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
    
    # Exemplo de monitoramento de preço
    if best_deals:
        print("\nMonitorando o melhor preço encontrado...")
        current_price = agent.monitor_price(best_deals[0].url)
        if current_price:
            print(f"\nPreço atual: R$ {current_price.price:.2f}")
            print(f"Última atualização: {current_price.timestamp}")


if __name__ == "__main__":
    main()