class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'dashboard-container';

        const sidebar = this.createSidebar();
        const mainContent = this.createMainContent();

        dashboardContainer.appendChild(sidebar);
        dashboardContainer.appendChild(mainContent);

        document.body.appendChild(dashboardContainer);
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';

        const title = document.createElement('h2');
        title.innerText = 'Admin Panel';
        sidebar.appendChild(title);

        const nav = document.createElement('nav');
        nav.innerHTML = `
            <ul>
                <li><a href="#add-dog">Add Dog</a></li>
                <li><a href="#manage-dogs">Manage Dogs</a></li>
            </ul>
        `;
        sidebar.appendChild(nav);

        return sidebar;
    }

    createMainContent() {
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';

        const header = document.createElement('h1');
        header.innerText = 'Dashboard';
        mainContent.appendChild(header);

        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';
        mainContent.appendChild(contentArea);

        return mainContent;
    }

    setupEventListeners() {
        window.addEventListener('hashchange', () => {
            this.loadContent();
        });
        this.loadContent();
    }

    loadContent() {
        const hash = window.location.hash;
        const contentArea = document.querySelector('.content-area');

        if (hash === '#add-dog') {
            contentArea.innerHTML = '';
            const addDogForm = new AddDogForm();
            contentArea.appendChild(addDogForm.render());
        } else if (hash === '#manage-dogs') {
            contentArea.innerHTML = '';
            const manageDogs = new ManageDogs();
            contentArea.appendChild(manageDogs.render());
        } else {
            contentArea.innerHTML = '<p>Welcome to the Admin Dashboard!</p>';
        }
    }
}

export default Dashboard;