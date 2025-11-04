document.addEventListener('DOMContentLoaded', () => {
    initSPARouting();
    runPageSpecificLogic(window.location.pathname);
});

/**
 * Roteador: Direciona a execução do JS com base na página carregada.
 */
function runPageSpecificLogic(path) {
    if (path.endsWith('/') || path.endsWith('index.html')) {
        // No momento, sem lógica para index
    } else if (path.endsWith('projetos.html')) {
        loadProjectsFromJSON();
    } else if (path.endsWith('cadastro.html')) {
        initCadastroFormValidation();
    }
}

const mainContent = document.querySelector('main');

/**
 * Assume os links de navegação, criando o SPA.
 */
function initSPARouting() {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        if (href && (href.endsWith('.html') || href === '/')) {
            e.preventDefault();
            navigateTo(href);
        }
    });

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            loadPage(e.state.path, false);
        }
    });

    history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
}

/**
 * Controla a navegação para uma nova "página".
 */
function navigateTo(path) {
    loadPage(path, true);
}

/**
 * Carrega o conteúdo da nova página via fetch e renderiza.
 */
async function loadPage(path, pushState) {
    mainContent.style.opacity = '0.5';

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Falha ao carregar página.');

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const newMain = doc.querySelector('main').innerHTML;
        const newTitle = doc.querySelector('title').textContent;

        mainContent.innerHTML = newMain;
        document.title = newTitle;
        mainContent.style.opacity = '1';

        if (pushState) {
            history.pushState({ path: path }, newTitle, path);
        }

        runPageSpecificLogic(path);

    } catch (err) {
        console.error('Falha ao carregar página:', err);
        window.location.href = path; // Fallback em caso de erro de CORS
    }
}

/**
 * Busca dados do projetos.json e os renderiza na página.
 */
async function loadProjectsFromJSON() {
    const container = document.querySelector('#nossos-projetos .row');
    if (!container) return;

    container.innerHTML = `<p style="text-align: center; width: 100%;">Carregando projetos...</p>`;

    try {
        const response = await fetch('data/projetos.json');
        if (!response.ok) throw new Error('Falha ao carregar projetos.json');

        const data = await response.json();

        container.innerHTML = data.projects.map(project => renderProjectCard(project)).join('');

    } catch (err) {
        console.error('Falha ao carregar projetos.json:', err);
        container.innerHTML = `<p class="alert alert-error">Erro ao carregar projetos. Tente novamente mais tarde.</p>`;
    }
}

/**
 * Recebe um objeto project e retorna o HTML do card.
 */
function renderProjectCard(project) {
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


/**
 * Assume a validação do formulário de cadastro.
 */
function initCadastroFormValidation() {
    const form = document.querySelector('.form-container');
    if (!form) return;

    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = 'form-global-feedback';
    form.prepend(feedbackContainer);

    form.addEventListener('reset', () => {
        feedbackContainer.innerHTML = '';
        form.querySelectorAll('.form-feedback').forEach(el => el.remove());
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackContainer.innerHTML = '';

        const isValid = validateForm(form);

        if (isValid) {
            feedbackContainer.innerHTML = `
                <div class="alert alert-success">
                    <strong>Obrigado!</strong> Seu cadastro foi enviado com sucesso.
                </div>`;
            form.reset();
        } else {
            feedbackContainer.innerHTML = `
                <div class="alert alert-error">
                    <strong>Ops!</strong> Por favor, corrija os erros no formulário.
                </div>`;

            const firstError = form.querySelector('.form-feedback');
            if(firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

/**
 * Valida todos os campos obrigatórios do formulário.
 */
function validateForm(form) {
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
        else if (field.type === 'email' && !isValidEmail(field.value)) {
            error = 'Por favor, insira um e-mail válido.';
        }

        if (error) {
            allValid = false;
            showFieldError(field, error);
        }
    });
    return allValid;
}

/**
 * Exibe uma mensagem de erro customizada abaixo do campo.
 */
function showFieldError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-feedback';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

/**
 * Valida e-mail.
 */
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}