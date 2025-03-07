global without sharing class UserProfileController {

    @AuraEnabled(cacheable=true)
    public static List<Usuario__c> getMyProfile(String email) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('Email não pode estar vazio.');
        }
    
        List<Usuario__c> userList = [SELECT Id, UserName__c, Name FROM Usuario__c WHERE Email__c = :email];
        return userList;
}

    @AuraEnabled
    public static void deleteSchedulingRecord(Id recordId) {
        try {
            if (recordId == null) {
                throw new AuraHandledException('ID do registro não pode ser nulo.');
            }
            delete [SELECT Id FROM Agendamento__c WHERE Id = :recordId];
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao apagar o registro: ' + e.getMessage());
        }
}




}