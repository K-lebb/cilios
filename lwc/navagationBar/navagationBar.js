import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class NavagationBar extends LightningElement {
    eventRegistered = false;

    renderedCallback() {
        if (!this.eventRegistered) {  
            const hamburguerMenuButton = this.template.querySelector('.hamburguer-menu-button');
            if (hamburguerMenuButton) {
                hamburguerMenuButton.addEventListener('click', this.handleHamburguerMenuButtonClick.bind(this));
                this.eventRegistered = true;
            }
        }
        if (window.innerWidth <= 767) {
            const navigationMenu = this.template.querySelector('.navigation-menu')
            if (navigationMenu) {
                const closeBtn = document.createElement('span');
                closeBtn.classList.add('close-btn');
                closeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11083)"> <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11083"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>`;

                // Adicionando estilos inline
                closeBtn.style.display = 'flex';
                closeBtn.style.justifyContent = 'center';
                closeBtn.style.alignItems = 'center';
                closeBtn.style.position = 'absolute';
                closeBtn.style.color = '#fff';
                closeBtn.style.top = '5px';
                closeBtn.style.left = '5px';
                closeBtn.style.width = '20px';
                closeBtn.style.height = '20px';
                closeBtn.style.cursor = 'pointer';

                closeBtn.addEventListener('click', () => {
                    navigationMenu.classList.remove('show');
                });
                navigationMenu.appendChild(closeBtn);
            }
        } else {
            const closeBtn = this.template.querySelector('.close-button');
            if (closeBtn) {
                closeBtn.remove();
            }
        }
        
    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Sucesso!',
            message: 'A operação foi concluída com sucesso.',
            variant: 'success',
        });
        this.dispatchEvent(event);
    }

    handleHamburguerMenuButtonClick() {
        const navigationMenu = this.template.querySelector('.navigation-menu');
        if (navigationMenu) {
            navigationMenu.classList.add('show');
        } else {
            console.error('Elemento navigation-menu não encontrado!');
        }
    }
}