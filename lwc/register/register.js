import { LightningElement, track } from 'lwc';
import sendCad from '@salesforce/apex/CadsController.sendCad';

export default class Register extends LightningElement {
    @track nome = ''; 
    @track userName = '';
    @track email = '';
    @track password = '';
    @track successMessage = '';
    @track errorMessage = '';
    @track showModal = false;
    @track modalTitle = '';
    @track modalMessage = '';

    handleInputChange(event) {
        const field = event.target.dataset.field;
        if (field) {
            this[field] = event.target.value;
        }
    }

    handleSubmit() {
        if (!this.nome || !this.userName || !this.email || !this.password) {
            this.errorMessage = 'Preencha todos os campos obrigatórios.';
            return;
        }

        const cadData = {
            nome: this.nome,
            email: this.email,
            senha: this.password,
            userName: this.userName
        };

        sendCad({ data: cadData })
            .then((response) => {
                if (response.status === 'success') {
                    this.clearFields();
                    this.successMessage = response.message;
                    this.openModal('Cadastro Realizado', response.message);
                } else {
                    this.errorMessage = response.message;
                }
            })
            .catch((error) => {
                const errorMessage = error.body?.message || 'Erro desconhecido.';
                this.errorMessage = 'Erro ao cadastrar: ' + errorMessage;
            });
    }

    clearFields() {
        this.nome = '';
        this.userName = '';
        this.email = '';
        this.password = '';
        this.successMessage = '';
        this.errorMessage = '';
    }

    openModal(title, message) {
        this.modalTitle = title;
        this.modalMessage = message;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}