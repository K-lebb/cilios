import { LightningElement, wire } from 'lwc';
import sendSchedules from '@salesforce/apex/SchedulesController.sendSchedules';
import getFutureSchedules from '@salesforce/apex/SchedulesController.getFutureSchedules';

export default class SchedulesButton extends LightningElement {
    showModal = false;
    modalTitle = '';
    modalMessage = '';
    email = '';
    selectedProcedures = [];
    selectedDate = '';
    selectedTime = '';
    errorMessage = '';
    successMessage = '';
    invalidDate = false;
    futureSchedules = [];

    procedimentos = [
        { label: 'Limpeza de Pele', value: 'Limpeza de Pele' },
        { label: 'Extensão de Cílios', value: 'Extensão de Cílios' },
        { label: 'Manutenção de Cílios', value: 'Manutenção de Cílios' },
        { label: 'Retirada de Cílios', value: 'Retirada de Cílios' },
        { label: 'Pigmentação dos Lábios', value: 'Pigmentação dos Lábios' }
    ];

    excludedTimes = [];

    get availableTimes() {
        const now = new Date();
        const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const times = ["Selecione um horário"];

        if (today === this.selectedDate) {
            console.log(`Data Selecionada: ${this.selectedDate}`);
            console.log(`Data Atual: ${today}`);
            for (let hour = 8; hour <= 18; hour++) {
                for (let minute = 0; minute < 60; minute++) {
                    const formattedTime = this.formatTime(hour, 0);
                    if (hour > currentHour || (hour === currentHour && minute >= currentMinute)) {
                        times.push({ label: formattedTime, value: formattedTime });
                    }
                }
            }
            return times;
        } else if (this.selectedDate > today) {
            for (let hour = 8; hour <= 18; hour++) {
                const formattedTime = this.formatTime(hour, 0);
                times.push({ label: formattedTime, value: formattedTime });
            }
            return times;
        }
    }

    formatTime(hour, minute) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    connectedCallback() {
        this.email = sessionStorage.getItem('userEmail');
        this.checkVariableStatus(1000);
    }

    handleShowModal() {
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    checkVariableStatus(intervalTime) {
        const now = new Date();
        const hourNow = this.formatTime(now.getHours(), now.getMinutes());
        const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

        this.intervalId = setInterval(() => {
            if (this.selectedDate && this.selectedTime) {
                const isPastDateTime =
                    this.selectedDate < todayDate ||
                    (this.selectedDate === todayDate && this.selectedTime <= hourNow);

                if (isPastDateTime) {
                    if (!this.excludedTimes.includes(this.selectedTime)) {
                        this.excludedTimes = [...this.excludedTimes, this.selectedTime];
                    }
                    this.errorMessage = 'Escolha um dia válido.';
                    this.invalidDate = true;
                } else {
                    this.invalidDate = false;
                    this.errorMessage = '';
                }
            }
        }, intervalTime);
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    handleProcedureChange(event) {
        this.selectedProcedures = event.detail.value;
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;
    }

    handleTimeChange(event) {
        this.selectedTime = event.target.value;
    }

    openModal() {
        this.modalTitle = 'Agendamentos';
        this.modalMessage = 'Para agendar um horário, selecione os procedimentos, o dia e o horário desejado.';
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.clearMessages();
        this.clearFields();
    }

    clearMessages() {
        this.errorMessage = '';
        this.successMessage = '';
    }

    clearFields() {
        this.selectedProcedures = [];
        this.selectedDate = '';
        this.selectedTime = '';
    }

    convertMilisecondsToHours(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        return this.formatTime(hours, minutes);
    }

    @wire(getFutureSchedules)
    isScheduleNotAvailable({ data, error }) {
        if (data) {
            for (const schedule of data) {
                console.log(`------- Agendamento: ${schedule.Data__c} e ${this.convertMilisecondsToHours(schedule.Hora__c)} -------`);
                console.log(schedule);
                
                this.futureSchedules.push({
                    id: schedule.Id,
                    email: schedule.Email__c,
                    data: schedule.Data__c,
                    hora: this.convertMilisecondsToHours(schedule.Hora__c)
                })
            }
            console.log(this.futureSchedules);
            
        }
    }



    handleSubmit() {
        if (!this.selectedProcedures.length || !this.selectedDate || !this.email || !this.selectedTime) {
            this.errorMessage = 'Preencha todos os campos obrigatórios.';
            return;
        }
        if (this.invalidDate) {
            this.errorMessage = 'Escolha um dia entre hoje e uma semana depois.';
            return;
        }
        if (this.futureSchedules.some(schedule => schedule.data === this.selectedDate && schedule.hora === this.selectedTime)) {
            this.errorMessage = 'Horário indisponível.';
            return;
        }


        const cadSchedules = {
            email: this.email,
            data: this.selectedDate,
            hora: this.selectedTime
        };

        sendSchedules({ data: cadSchedules, procedimentos: this.selectedProcedures })
            .then((response) => {
                if (response === 'success') {
                    this.clearFields();
                    this.successMessage = 'Agendamento realizado com sucesso!';
                    this.closeModal();
                    window.location.reload();
                } else {
                    this.errorMessage = 'Falha ao realizar o agendamento.';
                }
            })
            .catch((error) => {
                this.errorMessage = 'Erro ao cadastrar: ' + (error.body?.message || 'Erro desconhecido.');
            });
    }

    isProcedureSelected(value) {
        return this.selectedProcedures.includes(value);
    }
}