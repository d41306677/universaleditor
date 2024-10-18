import { h, render, Component } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

class DynamicHeader extends Component {
  state = {
    menuItems: this.props.menuItems || [],
    logo: this.props.logo || {},
    isMobileMenuOpen: false, // State to track mobile menu visibility
  };

  // Function to toggle the mobile menu
  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }));
  };

  componentDidMount() {
    // Event listeners for mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Event listeners for submenu toggle
    const submenuToggle = document.getElementById('submenu-toggle');
    const mobileSubmenu = document.getElementById('mobile-submenu');
    submenuToggle.addEventListener('click', () => {
      mobileSubmenu.classList.toggle('hidden');
    });

    // Event listeners for tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons and hide all tab panes
        tabButtons.forEach((button) => {
          button.classList.remove('active-tab');
        });
        tabPanes.forEach((pane) => {
          pane.classList.add('hidden');
        });

        // Add active class to the clicked button and show the corresponding tab pane
        btn.classList.add('active-tab');
        const targetPane = document.getElementById(btn.dataset.target);
        if (targetPane) {
          targetPane.classList.remove('hidden');
        }
      });
    });
  }

  render() {
    const { menuItems, logo, isMobileMenuOpen } = this.state;

    if (!logo.link || !logo.image) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <header class="bg-[#373737] shadow-md">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center py-4">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <a href=${logo.link} class="text-2xl font-bold text-white">
                <img src=${logo.image} alt=${logo.alt || 'Logo'} class="h-8" />
              </a>
            </div>

            <!-- Menu Links for larger screens -->
            <div class="hidden md:flex space-x-5 ml-8">
              ${menuItems.map((item) => html`
                <div class="relative group" key=${item.text}>
                  <a href=${item.link} class="text-white hover:text-gray-200">
                    ${item.text}
                  </a>
                  ${item.subMenu ? html`
                    <div class="relative">
                      <button class="text-white hover:text-gray-200 focus:outline-none flex items-center">
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      <div class="submenu absolute left-0 bg-white shadow-lg rounded-lg py-2 w-48 z-10">
                        ${item.subMenu.map((subItem) => html`
                          <a href=${subItem.link} class="block px-4 py-2 text-gray-700 hover:bg-gray-100" key=${subItem.text}>
                            ${subItem.text}
                          </a>
                        `)}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `)}
            </div>

            <!-- Hamburger Menu Button for mobile view -->
            <div class="md:hidden ml-auto">
              <button
                id="menu-toggle"
                class="text-white hover:text-gray-200 focus:outline-none"
                onClick=${this.toggleMobileMenu}
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Menu -->
          <div id="mobile-menu" class=${isMobileMenuOpen ? '' : 'hidden'}>
            ${menuItems.map((item) => html`
              <a href=${item.link} class="block px-4 py-2 text-white hover:bg-gray-200" key=${item.text}>
                ${item.text}
              </a>
              ${item.subMenu ? html`
                <div class="relative">
                  <button class="block w-full text-left px-4 py-2 text-white hover:bg-gray-200" id="submenu-toggle">
                    ${item.text}
                    <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div id="mobile-submenu" class="ml-4 hidden">
                    ${item.subMenu.map((subItem) => html`
                      <a href=${subItem.link} class="block px-4 py-2 text-gray-700 hover:bg-gray-100" key=${subItem.text}>
                        ${subItem.text}
                      </a>
                    `)}
                  </div>
                </div>
              ` : ''}
            `)}
          </div>
        </nav>
      </header>
    `;
  }
}


// AEM Edge Delivery Service Block
export default async function decorate(block) {
  try {
    // Fetch logo and menu items from an API endpoint
    const response = await fetch('/blocks/header/header.json');
    const data = await response.json();

    // Pass fetched logo and menu items to the Preact component
    const app = html`<${DynamicHeader} logo=${data.logo} menuItems=${data.menuItems} />`;
    render(app, block);
  } catch (error) {
    // Handle fetch error
    const errorMessage = html`<div>Error: Failed to load header items.</div>`;
    render(errorMessage, block);
  }
}
