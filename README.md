# Ciência da Computação
#### Cruzeiro do Sul
#### Desenvolvimento Front-End Para Web

---

## Atividade 4 (final)
Atividade 4 com WCAG e otimização produção.

---

### Atenção!
Para rodar o projeto sem problemas, é necessário fazer o host do mesmo (Apache, NGINX, etc).<br>
Caso contrário, requests SPA serão barrados devido ao CORS.

---

## Visão Geral da Plataforma

A plataforma é um sistema web que oferece às ONGs uma presença digital profissional e funcional, permitindo divulgar projetos, captar recursos e engajar voluntários.

### Áreas

* **Visitante:** Conhece a organização, seus projetos e informações de contato.
* **Voluntário:** Cadastra-se para oportunidades de voluntariado.
* **Doador:** Conhece os projetos e se cadastra para realizar doações.

### Funcionalidades

* **Navegação:** Menu responsivo com dropdown e versão mobile (hambúrguer).
* **Páginas:** Home, Projetos e Cadastro.
* **Projetos:** Carregamento dinâmico dos cards de projeto a partir de um arquivo `JSON`.
* **Cadastro:** Formulário complexo com validação de dados em tempo real.
* **Tema:** Seletor de modo claro e escuro (Dark Mode) com persistência no `localStorage`.
* **Navegação Rápida:** O site funciona como uma SPA (Single Page Application), carregando conteúdo sem recarregar a página.

### Acessibilidade

* **Contraste de Cores:** A paleta de cores original foi ajustada para garantir um contraste mínimo de 4.5:1 para todo texto normal, atendendo ao Nível AA.
* **Modo Escuro / Alto Contraste:** Implementado um seletor de tema que alterna entre os modos claro e escuro, ambos com paletas de cores que respeitam as regras de contraste.
* **Navegação por Teclado:** O site é 100% navegável utilizando apenas a tecla `Tab`.

---

### Releases

* **1.0.0:** Projeto base ONG Impacto Social
* **2.0.0:** Utilização de CSS e responsividade em mobile.
* **3.0.0:** SPA com fallback.
* **4.0.0:** Acessibilidade (WCAG).
* **4.1.0:** Otimização para deploy em produção (js, css e imgs).
