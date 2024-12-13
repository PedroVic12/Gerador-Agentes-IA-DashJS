from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import List, Dict, Optional
import json
import time

def create_pdf(filename: str, content: Dict) -> str:
    """Cria um PDF com o conteúdo fornecido."""
    try:
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        story.append(Paragraph(content.get('title', 'Documento'), title_style))
        story.append(Spacer(1, 12))

        # Conteúdo
        for paragraph in content.get('paragraphs', []):
            story.append(Paragraph(paragraph, styles['Normal']))
            story.append(Spacer(1, 12))

        # Links
        if content.get('links'):
            story.append(Paragraph('Links:', styles['Heading2']))
            for link in content['links']:
                story.append(Paragraph(
                    f"{link['text']}: {link['href']}", 
                    styles['Normal']
                ))
                story.append(Spacer(1, 6))

        doc.build(story)
        return filename

    except Exception as e:
        print(f"Erro ao criar PDF: {str(e)}")
        return ""

def load_json_data(json_file: str) -> Dict:
    """Carrega dados de um arquivo JSON."""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar JSON: {str(e)}")
        return {}

def create_report_from_json(json_file: str) -> str:
    """Cria um relatório PDF a partir de um arquivo JSON."""
    data = load_json_data(json_file)
    if data:
        pdf_filename = f"report_{int(time.time())}.pdf"
        return create_pdf(pdf_filename, data)
    return ""

def main():
    # Exemplo de uso
    print("1. Criando PDF com dados de exemplo...")
    content = {
        'title': 'Relatório de Exemplo',
        'paragraphs': [
            'Este é um exemplo de relatório PDF gerado automaticamente.',
            'Você pode personalizar o conteúdo conforme necessário.'
        ],
        'links': [
            {'text': 'Documentação Python', 'href': 'https://docs.python.org'},
            {'text': 'ReportLab', 'href': 'https://www.reportlab.com/docs/'}
        ]
    }
    
    pdf_file = create_pdf('exemplo.pdf', content)
    print(f"PDF criado: {pdf_file}")
    
    # Exemplo de criação de relatório a partir de JSON
    print("\n2. Criando relatório a partir de JSON...")
    json_file = "scraping_data_example.json"  # Substitua pelo seu arquivo JSON
    if create_report_from_json(json_file):
        print("Relatório criado com sucesso!")
    
if __name__ == "__main__":
    main()
