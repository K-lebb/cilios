import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getMySchedules from '@salesforce/apex/SchedulesController.getMySchedules';
import deleteSchedule from '@salesforce/apex/SchedulesController.deleteSchedule';

export default class MySchedules extends LightningElement {
    @track products = [];
    @track email = '';

    connectedCallback() {
        this.email = sessionStorage.getItem('userEmail');
        if (!this.email) {
            console.error('E-mail não encontrado no sessionStorage');
        } else {
            console.log('E-mail carregado:', this.email);
        }
    }

    @wire(getMySchedules, { email: '$email' })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map(product => {
                const hora = new Date();
                hora.setHours(Math.floor(product.Hora__c / 3600000)); // Converte o valor de para horas
                hora.setMinutes((product.Hora__c % 3600000) / 60000); // Converte o valor de para minutos

                const timeString = hora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false });

                const dateTime = this.formatDateToBrasilia(product.Data__c, timeString);
                console.log('Data formatada:', dateTime);
                console.log(`Criando a data com: ${product.Data__c} e ${product.Hora__c} formatada para => ${timeString}`);

                const [date, time] = dateTime.split(', ');

                return {
                    id: product.Id,
                    data: date || 'Data inválida',  // Verificando se a data é válida
                    hora: time || 'Hora inválida',  // Verificando se a hora é válida
                    procedimento: product.Procedimento__c,
                    dono: product.UsuarioAgendado__r?.Name || 'Usuário Desconhecido'
                };
            });
        } else if (error) {
            console.error('Erro ao buscar os agendamentos:', error);
        }
    }

    formatDateToBrasilia(dateString, timeString) {
        try {
            // Verificar se a data e a hora estão presentes
            if (!dateString || !timeString) {
                throw new Error('Data ou Hora inválida');
            }

            console.log('Data recebida:', dateString);
            console.log('Hora recebida:', timeString);

            // A data está no formato DD-MM-YYYY, precisamos inverter para YYYY-MM-DD para o JavaScript entender
            const [year, month, day] = dateString.split('-');
            const [hour, minute] = timeString.split(':');

            // Verificar se os valores de hora e minuto são válidos
            if (isNaN(hour) || isNaN(minute)) {
                throw new Error('Hora inválida');
            }

            // Log de depuração para verificar o que estamos passando
            console.log(`Criando a data com: ${year}-${month}-${day}T${hour}:${minute}:00`);

            // Criar um objeto Date com base no formato correto
            const dateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);

            // Verificar se a data foi criada corretamente
            if (isNaN(dateTime.getTime())) {
                throw new Error('Data inválida');
            }

            // Log da data criada
            console.log('Data formatada:', dateTime);

            // Definir as opções para a formatação
            const options = {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };

            // Formatar a data e hora
            return new Intl.DateTimeFormat('pt-BR', options).format(dateTime);
        } catch (error) {
            console.error('Erro ao formatar a data:', error);
            return 'Data inválida';  // Retorna uma string de erro se ocorrer algum problema
        }
    }

    deleteSchedule (event) {
        const scheduleId = event.target.dataset.id;
        
        if (!scheduleId) {
            console.error('ID do agendamento inválido');
            return;
        }
        
        deleteSchedule({ recordId: scheduleId })
        .then(() => {
            this.products = this.products.filter(product => product.id !== scheduleId);
                console.log('Registro apagado com sucesso. ID:', scheduleId);
                return refreshApex(this.wiredProducts);
            })
            .catch(error => {
                console.error('Erro ao apagar o agendamento:', error);
            });
    }

}