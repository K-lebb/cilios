import { LightningElement, track } from 'lwc';
import sendLogin from '@salesforce/apex/LoginController.sendLogin';

export default class Login extends LightningElement {
    @track email = ''; 
    @track password = '';
    @track modalTitle = '';
    @track modalMessage = '';
    @track showModal = false;
    @track isLoginSuccessful = false;

    handleEmailChange(event) {
        this.email = event.target.value; 
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleLogin() {
        if (!this.email || !this.password) {
            this.openModal('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
    
        sendLogin({ 
            data: { 
                email: this.email, 
                senha: this.password 
            } 
        })
            .then((response) => {
                if (response.status === 'success') {
                    this.openModal('Sucesso', 'Login realizado com sucesso!');
                    this.isLoginSuccessful = true;
                    sessionStorage.setItem('userEmail', this.email); 
                    this.clearFields();
                } else {
                    this.openModal('Erro', response.message);
                    this.isLoginSuccessful = false;
                }
            })
            .catch((error) => {
                this.openModal('Erro', 'Erro ao Logar: ' + error.body.message);
            });
    }
    

    openModal(title, message) {
        this.modalTitle = title;
        this.modalMessage = message;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    clearFields() {
        this.email = '';
        
        this.password = '';
    }

    carregar() {
        window.location.href = '/';
    }
    
}