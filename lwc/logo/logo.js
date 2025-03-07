import { LightningElement } from 'lwc';
import logo2 from '@salesforce/resourceUrl/Logo2'; // Utilize o nome que você deu ao recurso estático

export default class Logo extends LightningElement {
    logoUrl = logo2; 
    
    reload() {
        window.location.reload();
    }
}