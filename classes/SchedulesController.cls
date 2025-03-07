global without sharing class SchedulesController {
    @AuraEnabled(cacheable=false)
    public static String sendSchedules(Map<String, Object> data, List<String> procedimentos) {
        try {
            String email = (String) data.get('email');

            System.debug('-----------------------------Procedimentos recebidos: ' + procedimentos + '-----------------------');

            String hora = (String) data.get('hora');
            String dataString = (String) data.get('data');
        
            if (procedimentos == null || procedimentos.isEmpty()) {
                throw new AuraHandledException('Nenhum procedimento selecionado.');
            }
        
            Date dataAgendamento;
            try {
                dataAgendamento = Date.valueOf(dataString);
            } catch (Exception e) {
                throw new AuraHandledException('Formato de data inválido.');
            }
        
            Time horaAgendamento;
            try {
                List<String> horaPartes = hora.split(':');
                if (horaPartes.size() != 2) {
                    throw new AuraHandledException('Formato de hora inválido.');
                }
                Integer horas = Integer.valueOf(horaPartes[0]);
                Integer minutos = Integer.valueOf(horaPartes[1]);
                horaAgendamento = Time.newInstance(horas, minutos, 0, 0);
            } catch (Exception e) {
                throw new AuraHandledException('Formato de hora inválido.');
            }
        
            // Buscar o usuário com o email fornecido
            List<Usuario__c> userList = UserProfileController.getMyProfile(email);
            if (userList.isEmpty()) {
                throw new AuraHandledException('Usuário não encontrado');
            }
            String userId = userList[0].Id;
        
            List<Agendamento__c> agendasToInsert = new List<Agendamento__c>();
        
            for (String procedimento : procedimentos) {
                Agendamento__c agenda = new Agendamento__c();
                agenda.Data__c = dataAgendamento;
                agenda.Procedimento__c = procedimento;
                agenda.Hora__c = horaAgendamento;
                agenda.UsuarioAgendado__c = userId;
        
                agendasToInsert.add(agenda);
            }
        
            if (!agendasToInsert.isEmpty()) {
                try {
                    insert agendasToInsert;
                } catch (DmlException e) {
                    throw new AuraHandledException('Erro ao salvar agendamento: ' + e.getMessage());
                }
            }
        
            return 'success';
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao salvar agendamento: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Agendamento__c> getMySchedules(String email) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('O email não pode estar vazio.');
        }

        return [
            SELECT Id, Data__c, Hora__c, Procedimento__c, UsuarioAgendado__r.Name 
            FROM Agendamento__c 
            WHERE UsuarioAgendado__r.Email__c = :email 
            ORDER BY Data__c DESC, Hora__c DESC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Agendamento__c> getFutureSchedules () {
        Date now = Date.today();
        return [
            SELECT 
                Id, Data__c, Hora__c, Procedimento__c, UsuarioAgendado__r.Name
            FROM Agendamento__c 
            WHERE Data__c >= :now
            ORDER BY Data__c, Hora__c
        ];
    }

    @AuraEnabled
    public static void deleteSchedule(Id recordId) {
        try {
            if(recordId == null) {
                throw new AuraHandledException('ID do registro não pode ser nulo.');
            }
            delete [SELECT Id FROM Agendamento__c WHERE Id = :recordId];
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao apagar o agendamento: ' + e.getMessage());
        }
    }
}