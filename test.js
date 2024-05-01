const axios = require('axios');

// Função para obter os horários disponíveis para um dia específico
async function getHorarios(ano, mes, dia) {
    try {
        const response = await axios.get(`http://localhost:3000/horarios/${ano}/${mes}/${dia}`);
        console.log(`Horários disponíveis para o dia ${dia}/${mes}/${ano}:`, response.data);
    } catch (error) {
        console.error('Erro ao obter os horários:', error.response.data);
    }
}

// Teste: obter os horários disponíveis para o dia 1 de maio de 2024
getHorarios(2024, 5, 1);
