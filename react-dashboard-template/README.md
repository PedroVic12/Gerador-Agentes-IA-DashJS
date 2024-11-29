# React Dashboard Template

Um template moderno de dashboard construído com React, TypeScript e Express, seguindo princípios SOLID e boas práticas de desenvolvimento.

## 🚀 Funcionalidades

### 1. Autenticação e Autorização
- Login/Registro com múltiplos provedores (Email, Google, GitHub)
- Gerenciamento de sessões
- Controle de acesso baseado em roles (RBAC)
- Proteção de rotas

### 2. Gerenciamento de Usuários
- CRUD completo de usuários
- Perfis de usuário
- Gerenciamento de permissões
- Upload de avatar

### 3. Dashboard Analytics
- Gráficos e métricas em tempo real
- Visualizações customizáveis
- Exportação de relatórios
- Filtros avançados

### 4. Gerenciamento de Conteúdo
- Editor de conteúdo rico
- Upload de mídia
- Versionamento de conteúdo
- Preview em tempo real

### 5. Notificações
- Sistema de notificações em tempo real
- Emails transacionais
- Alertas customizáveis
- Centro de notificações

### 6. Configurações
- Temas customizáveis (Dark/Light mode)
- Preferências de usuário
- Configurações de sistema
- Internacionalização (i18n)

## 🏗️ Arquitetura

### Frontend (React + TypeScript)
- `/src`
  - `/components` - Componentes reutilizáveis
  - `/features` - Funcionalidades específicas do domínio
  - `/hooks` - Custom hooks React
  - `/layouts` - Layouts da aplicação
  - `/lib` - Bibliotecas e configurações
  - `/pages` - Componentes de página
  - `/services` - Serviços de API
  - `/store` - Gerenciamento de estado
  - `/styles` - Estilos globais e temas
  - `/types` - Definições de tipos TypeScript
  - `/utils` - Utilitários e helpers

### Backend (Express + TypeScript)
- `/server`
  - `/config` - Configurações do servidor
  - `/controllers` - Controladores da API
  - `/middlewares` - Middlewares Express
  - `/models` - Modelos de dados
  - `/routes` - Rotas da API
  - `/services` - Lógica de negócio
  - `/utils` - Utilitários do servidor
  - `/validation` - Schemas de validação

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- React Query
- React Router DOM
- Axios
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- Zod
- Vitest
- React Testing Library

### Backend
- Express
- TypeScript
- Prisma
- JWT
- Zod
- Jest
- Supertest

## 🔧 Princípios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**
   - Componentes e serviços com responsabilidade única
   - Separação clara de concerns

2. **Open/Closed Principle (OCP)**
   - Uso de interfaces para extensibilidade
   - Componentes genéricos e adaptáveis

3. **Liskov Substitution Principle (LSP)**
   - Componentes base e especializados intercambiáveis
   - Uso correto de herança e composição

4. **Interface Segregation Principle (ISP)**
   - Interfaces pequenas e específicas
   - Hooks customizados focados

5. **Dependency Inversion Principle (DIP)**
   - Injeção de dependências
   - Inversão de controle

## 📦 Instalação e Uso

\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/react-dashboard-template.git

# Instale as dependências do frontend
cd react-dashboard-template/frontend
npm install

# Instale as dependências do backend
cd ../backend
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
\`\`\`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a Branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
