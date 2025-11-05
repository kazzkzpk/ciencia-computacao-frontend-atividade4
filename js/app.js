document.addEventListener('DOMContentLoaded', () => {
    Theme.initTheme();
    Router.initSPARouting();
    Router.runPageSpecificLogic(window.location.pathname);
});


const Router = {
    mainContent: document.querySelector('main'),

    initSPARouting() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');

            if (href && (href.endsWith('.html') || href === '/')) {
                e.preventDefault();
                this.navigateTo(href);
            }
        });

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                this.loadPage(e.state.path, false);
            }
        });

        history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
    },

    navigateTo(path) {
        this.loadPage(path, true);
    },

    async loadPage(path, pushState) {
        this.mainContent.style.opacity = '0.5';
        this.mainContent.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Falha ao carregar página.');

            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const newMain = doc.querySelector('main').innerHTML;
            const newTitle = doc.querySelector('title').textContent;

            this.mainContent.innerHTML = newMain;
            document.title = newTitle;
            this.mainContent.style.opacity = '1';
            this.mainContent.setAttribute('aria-busy', 'false');

            Theme.moveFocusToMainContent(this.mainContent);

            if (pushState) {
                history.pushState({ path: path }, newTitle, path);
            }

            this.runPageSpecificLogic(path);

        } catch (err) {
            console.error('Falha ao carregar página:', err);
            window.location.href = path;
        }
    },

    runPageSpecificLogic(path) {
        Theme.initThemeToggleListener();

        if (path.endsWith('/') || path.endsWith('index.html')) {
            // Lógica da Home
        } else if (path.endsWith('projetos.html')) {
            Templates.loadProjectsFromJSON();
        } else if (path.endsWith('cadastro.html')) {
            Validation.initCadastroFormValidation();
        }
    }
};

const Templates = {
    async loadProjectsFromJSON() {
        const container = document.querySelector('#nossos-projetos .row');
        if (!container) return;
        container.innerHTML = `<p role="status" aria-live="polite" style="text-align: center; width: 100%;">Carregando projetos...</p>`;

        try {
            const response = await fetch('data/projetos.json');
            if (!response.ok) throw new Error('Falha ao carregar projetos.json');

            const data = await response.json();
            container.innerHTML = data.projects.map(this.renderProjectCard).join('');

        } catch (err) {
            console.error('Falha ao carregar projetos.json:', err);
            container.innerHTML = `<div class="alert alert-error" role="alert">Erro ao carregar projetos. Tente novamente mais tarde.</div>`;
        }
    },

    renderProjectCard(project) {
        const tagsHTML = project.tags.map(tag =>
            `<span class="badge ${tag.class}">${tag.text}</span>`
        ).join('');

        return `
        <article class="col-md-6 col-lg-4">
            <div class="card">
                <img src="${project.image}" alt="${project.alt}" class="card-img">
                <div class="card-body">
                    <div>${tagsHTML}</div>
                    <h3 class="card-title">${project.title}</h3>
                    <p>${project.description}</p>
                    <a href="cadastro.html" class="btn btn-primary">Quero Ajudar</a>
                </div>
            </div>
        </article>
        `;
    }
};

const Validation = {
    initCadastroFormValidation() {
        const form = document.querySelector('.form-container');
        if (!form) return;

        const feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'form-global-feedback';
        feedbackContainer.setAttribute('aria-live', 'assertive');
        form.prepend(feedbackContainer);

        form.addEventListener('reset', () => {
            feedbackContainer.innerHTML = '';
            form.querySelectorAll('.form-feedback').forEach(el => el.remove());
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            feedbackContainer.innerHTML = '';

            const isValid = this.validateForm(form);

            if (isValid) {
                feedbackContainer.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        <strong>Obrigado!</strong> Seu cadastro foi enviado com sucesso.
                    </div>`;
                form.reset();
            } else {
                feedbackContainer.innerHTML = `
                    <div class="alert alert-error" role="alert">
                        <strong>Ops!</strong> Por favor, corrija os erros no formulário.
                    </div>`;

                const firstError = form.querySelector('.form-feedback');
                if(firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    },

    validateForm(form) {
        let allValid = true;
        form.querySelectorAll('.form-feedback').forEach(el => el.remove());

        const fields = form.querySelectorAll('[required]');

        fields.forEach(field => {
            let error = null;

            if (field.value.trim() === '') {
                error = 'Este campo é obrigatório.';
            }
            else if (field.pattern) {
                const regex = new RegExp(field.pattern);
                if (!regex.test(field.value)) {
                    error = field.title || 'Formato inválido.';
                }
            }
            else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                error = 'Por favor, insira um e-mail válido.';
            }

            if (error) {
                allValid = false;
                this.showFieldError(field, error);
            }
        });
        return allValid;
    },

    showFieldError(field, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'form-feedback';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;

        field.parentNode.appendChild(errorElement);
    },

    isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
};

const Theme = {
    initTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.initThemeToggleListener();
    },

    initThemeToggleListener() {
        const toggleButton = document.querySelector('#theme-toggle');
        if (!toggleButton) return;

        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            toggleButton.innerHTML = '&#9728;&#65039;';
            toggleButton.setAttribute('aria-label', 'Ativar modo claro');
        } else {
            toggleButton.innerHTML = '&#127769;';
            toggleButton.setAttribute('aria-label', 'Ativar modo escuro');
        }

        toggleButton.onclick = this.toggleTheme;
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        Theme.initThemeToggleListener();
    },

    moveFocusToMainContent(mainContent) {
        const newH1 = mainContent.querySelector('h1');
        if (newH1) {
            newH1.setAttribute('tabindex', '-1');
            newH1.focus();
        }
    }
};