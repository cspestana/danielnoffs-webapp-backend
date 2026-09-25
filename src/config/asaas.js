import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const API_KEY = process.env.ASAAS_API_KEY;

const asaasApi = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'access_token': API_KEY,
    'Content-Type': 'application/json'
  }
});

// Criar um pagamento via Pix
export const createPixPayment = async (email, amount, description) => {
  try {
    const response = await asaasApi.post('/payments', {
      customer: email,
      billingType: 'PIX',
      value: amount,
      description: description,
      dueDate: new Date().toISOString().split('T')[0]
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pagamento Asaas:', error.response?.data || error.message);
    throw error;
  }
};

// Criar um pagamento via Cartão
export const createCardPayment = async (email, amount, description, cardData) => {
  try {
    const response = await asaasApi.post('/payments', {
      customer: email,
      billingType: 'CREDIT_CARD',
      value: amount,
      description: description,
      dueDate: new Date().toISOString().split('T')[0],
      creditCard: {
        holderName: cardData.holderName,
        number: cardData.number,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.ccv
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pagamento cartão Asaas:', error.response?.data || error.message);
    throw error;
  }
};

// Verificar status de um pagamento
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await asaasApi.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error.response?.data || error.message);
    throw error;
  }
};

// Validar webhook do Asaas
export const validateAsaasWebhook = (payload, signature) => {
  // TODO: Implementar validação de assinatura Asaas
  // Comparar HMAC-SHA256 da payload com a assinatura
  return true;
};

export default asaasApi;