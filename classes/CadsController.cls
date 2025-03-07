global without sharing class CadsController {
    @AuraEnabled(cacheable = false)
    public static Map<String, Object> sendCad(Map<String, Object> data) {
        Map<String, Object> response = new Map<String, Object>();

        try {
            if (data == null || !data.containsKey('email') || !data.containsKey('senha') || !data.containsKey('nome')) {
                response.put('status', 'error');
                response.put('message', 'Parâmetros inválidos fornecidos. Certifique-se de que todos os campos estão preenchidos.');
                return response;
            }

            String email = (String)data.get('email');
            String userName = (String)data.get('userName');
            String senha = (String)data.get('senha');
            String nome = (String)data.get('nome');

            List<Usuario__c> registros = [
                SELECT Id, Email__c 
                FROM Usuario__c 
                WHERE Email__c = :email
            ];

            if (registros.isEmpty()) {
                Usuario__c user = new Usuario__c();
                user.Name = nome;
                user.UserName__c = userName;
                user.Email__c = email;
                user.Senha__c = senha;

                insert user;

                // Resposta de sucesso
                response.put('status', 'success');
                response.put('message', 'Cadastro realizado com sucesso.');
                response.put('usuarioId', user.Id);
                response.put('usuarioEmail', user.Email__c);
            } else {
                response.put('status', 'error');
                response.put('message', 'Já existe um usuário cadastrado com este email.');
            }
        } catch (Exception e) {
            response.put('status', 'error');
            response.put('message', 'Erro ao processar o cadastro: ' + e.getMessage());
        }

        return response;
    }
}