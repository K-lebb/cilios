public without sharing class LoginController {
    @AuraEnabled
    public static Map<String, String> sendLogin(Map<String, Object> data) {
        Map<String, String> response = new Map<String, String>();
        System.debug('Data received: ' + data);
        try {
            if (data == null || !data.containsKey('email') || !data.containsKey('senha')) {
                response.put('status', 'error');
                response.put('message', 'Parâmetros inválidos fornecidos.');
                return response;
            }
            
            String email = (String)data.get('email');
            String senha = (String)data.get('senha');
            
            Usuario__c usuario = [
                SELECT Id, Email__c 
                FROM Usuario__c 
                WHERE Email__c = :email AND Senha__c = :senha
                LIMIT 1
            ];

            if (usuario != null) {
                response.put('status', 'success');
                response.put('message', 'Login realizado com sucesso!');
            } else {
                response.put('status', 'error');
                response.put('message', 'Credenciais inválidas.');
            }
        } catch (Exception e) {
            response.put('status', 'error');
            response.put('message', 'Erro ao realizar login: ' + e.getMessage());
        }
        return response;
    }
}