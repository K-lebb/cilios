import { LightningElement, track, wire } from 'lwc';
import getMyProfile from '@salesforce/apex/UserProfileController.getMyProfile';

export default class ProfileUser extends LightningElement {
    @track email; 
    @track showProfile = false; 
    @track userName = ''; 
    @track products = []; 

    connectedCallback() {
        this.email = sessionStorage.getItem('userEmail');

        this.showProfile = !!this.email;
    }
 
    get isProfileVisible() {
        return this.showProfile ? 'hidden-bg' : '';
    }

    @wire(getMyProfile, { email: '$email' })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map(product => ({
                id: product.Id,
                nome: product.Name,
                username: product.UserName__c,
                email: this.email
            }));

            if (this.products.length > 0) {
                this.userName = this.products[0].username || 'Usuário Desconhecido';
            }
        } else if (error) {
            console.error('Erro ao buscar perfil:', error);
        }
    }

    logar() {
        window.location = '/login';
    }
    perfil(){
        window.location = '/perfil';
    }
}