import pyautogui
import time
from bs4 import BeautifulSoup
import requests
import json
from typing import Dict, List, Optional

def capture_screen(region: Optional[tuple] = None) -> str:
    """Captura a tela ou uma região específica e salva como imagem."""
    screenshot = pyautogui.screenshot(region=region)
    filename = f"screenshot_{int(time.time())}.png"
    screenshot.save(filename)
    return filename

def web_scraping(url: str) -> Dict:
    """Realiza web scraping em uma URL específica."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Exemplo de extração de dados
        data = {
            'title': soup.title.string if soup.title else '',
            'paragraphs': [p.text for p in soup.find_all('p')],
            'links': [{'text': a.text, 'href': a.get('href')} for a in soup.find_all('a')]
        }
        
        # Salva os dados em um arquivo JSON
        filename = f"scraping_data_{int(time.time())}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            
        return data
    
    except Exception as e:
        print(f"Erro durante o scraping: {str(e)}")
        return {}


def web_scraping_playwright(url: str) -> Dict:
    
    import playwright.sync_api as pw
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        content = page.content()
        soup = BeautifulSoup(content, 'html.parser')
        browser.close()
        
        # Exemplo de extração de dados
        data = {
            'title': soup.title.string if soup.title else '',
            'paragraphs': [p.text for p in soup.find_all('p')],
            'links': [{'text': a.text, 'href': a.get('href')} for a in soup.find_all('a')]
        }
        
        # Salva os dados em um arquivo JSON
        filename = f"scraping_data_{int(time.time())}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print("Dados extraídos e salvos em JSON")

        return data


def automate_actions(actions: List[Dict[str, tuple]]) -> None:
    """Automatiza ações do mouse e teclado."""
    try:
        for action in actions:
            for action_type, params in action.items():
                if action_type == 'click':
                    pyautogui.click(params[0], params[1])
                elif action_type == 'type':
                    pyautogui.typewrite(params[0], interval=params[1])
                elif action_type == 'wait':
                    time.sleep(params[0])
                
    except Exception as e:
        print(f"Erro durante a automação: {str(e)}")

def main():
    # Exemplo de uso das funções
    print("1. Capturando tela...")
    screenshot_file = capture_screen()
    print(f"Screenshot salvo como: {screenshot_file}")
    
    print("\n2. Realizando web scraping...")
    url = "https://docs.agentql.com/examples/python-examples"
    #data = web_scraping(url)
    data = web_scraping_playwright(url)
    if data:
        print(f"Título encontrado: {data['title']}")
        print(f"Numero de parágrafos: {len(data['paragraphs'])}")
        print(f"Numero de links: {len(data['links'])}")
    else:
        print("Nenhum dado extraido ou salvo.")
    
    print("\n3. Automatizando ações...")
    actions = [
        {'wait': (2,)},
        {'click': (100, 200)},
        {'type': ('Hello World', 0.1)},
    ]
    automate_actions(actions)
    
if __name__ == "__main__":
    main()
