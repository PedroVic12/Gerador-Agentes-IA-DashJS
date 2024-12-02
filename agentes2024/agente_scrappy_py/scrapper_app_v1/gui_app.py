import flet as ft
import web_scraper
import pdf_generator
import json
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pyautogui
import time

class ScraperApp:
    def __init__(self):
        self.current_screenshot = None
        self.current_data = None
    
    def initialize_selenium(self):
        """Inicializa o driver do Selenium."""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Executa em modo headless
        return webdriver.Chrome(options=chrome_options)
    
    def main(self, page: ft.Page):
        # Configurações da página
        page.title = "Web Scraper & PDF Generator"
        page.window_width = 1000
        page.window_height = 800
        page.padding = 20
        page.theme_mode = "light"
        
        # Componentes da interface
        url_input = ft.TextField(
            label="URL para Scraping",
            width=600,
            border_color=ft.colors.BLUE_400
        )
        
        status_text = ft.Text(size=16, color=ft.colors.GREY_700)
        
        # Container para exibir resultados do scraping
        results_view = ft.Column(
            scroll=ft.ScrollMode.AUTO,
            height=300,
            width=600,
        )
        
        # Container para exibir screenshot
        screenshot_view = ft.Image(
            width=600,
            height=300,
            fit=ft.ImageFit.CONTAIN,
            visible=False
        )
        
        def do_scraping(e):
            """Executa o web scraping."""
            try:
                status_text.value = "Iniciando scraping..."
                page.update()
                
                self.current_data = web_scraper.web_scraping(url_input.value)
                
                # Limpa resultados anteriores
                results_view.controls.clear()
                
                # Adiciona título
                results_view.controls.append(
                    ft.Text(f"Título: {self.current_data.get('title', '')}", size=20, weight=ft.FontWeight.BOLD)
                )
                
                # Adiciona parágrafos
                for p in self.current_data.get('paragraphs', [])[:5]:
                    results_view.controls.append(
                        ft.Text(p, size=16)
                    )
                
                # Salva dados em JSON
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                json_filename = f"scraping_result_{timestamp}.json"
                with open(json_filename, 'w', encoding='utf-8') as f:
                    json.dump(self.current_data, f, ensure_ascii=False, indent=4)
                
                status_text.value = f"Scraping concluído! Dados salvos em {json_filename}"
                page.update()
                
            except Exception as e:
                status_text.value = f"Erro no scraping: {str(e)}"
                page.update()
        
        def take_screenshot(e):
            """Captura screenshot da página."""
            try:
                status_text.value = "Capturando screenshot..."
                page.update()
                
                # Captura screenshot
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                self.current_screenshot = f"screenshot_{timestamp}.png"
                pyautogui.screenshot(self.current_screenshot)
                
                # Exibe screenshot
                screenshot_view.src = self.current_screenshot
                screenshot_view.visible = True
                
                status_text.value = f"Screenshot salvo como: {self.current_screenshot}"
                page.update()
                
            except Exception as e:
                status_text.value = f"Erro na captura: {str(e)}"
                page.update()
        
        def export_json(e):
            """Exporta dados para JSON."""
            if self.current_data:
                try:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"exported_data_{timestamp}.json"
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(self.current_data, f, ensure_ascii=False, indent=4)
                    status_text.value = f"Dados exportados para {filename}"
                    page.update()
                except Exception as e:
                    status_text.value = f"Erro ao exportar: {str(e)}"
                    page.update()
            else:
                status_text.value = "Nenhum dado para exportar. Execute o scraping primeiro."
                page.update()
        
        def generate_pdf(e):
            """Gera PDF com os dados do scraping."""
            if self.current_data:
                try:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"report_{timestamp}.pdf"
                    pdf_generator.create_pdf(filename, self.current_data)
                    status_text.value = f"PDF gerado com sucesso: {filename}"
                    page.update()
                except Exception as e:
                    status_text.value = f"Erro ao gerar PDF: {str(e)}"
                    page.update()
            else:
                status_text.value = "Nenhum dado para gerar PDF. Execute o scraping primeiro."
                page.update()
        
        # Botões
        buttons_row = ft.Row(
            controls=[
                ft.ElevatedButton("Iniciar Scraping", on_click=do_scraping, style=ft.ButtonStyle(color=ft.colors.WHITE, bgcolor=ft.colors.BLUE_400)),
                ft.ElevatedButton("Capturar Tela", on_click=take_screenshot, style=ft.ButtonStyle(color=ft.colors.WHITE, bgcolor=ft.colors.GREEN_400)),
                ft.ElevatedButton("Exportar JSON", on_click=export_json, style=ft.ButtonStyle(color=ft.colors.WHITE, bgcolor=ft.colors.ORANGE_400)),
                ft.ElevatedButton("Gerar PDF", on_click=generate_pdf, style=ft.ButtonStyle(color=ft.colors.WHITE, bgcolor=ft.colors.RED_400))
            ],
            spacing=20
        )
        
        # Layout principal
        page.add(
            ft.Column(
                controls=[
                    url_input,
                    buttons_row,
                    status_text,
                    ft.Divider(),
                    ft.Text("Resultados do Scraping:", size=20, weight=ft.FontWeight.BOLD),
                    results_view,
                    ft.Divider(),
                    ft.Text("Screenshot:", size=20, weight=ft.FontWeight.BOLD),
                    screenshot_view
                ],
                spacing=20
            )
        )

def main():
    app = ScraperApp()
    ft.app(target=app.main)

if __name__ == "__main__":
    main()
