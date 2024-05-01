// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { createHorariosTable, agendarHorario, getHorariosAgendados, openDatabase} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar corpos de solicitação JSON
app.use(bodyParser.json());

// Rota para obter os horários disponíveis para um dia específico
app.get('/horarios/:ano/:mes/:dia', (req, res) => {
    const { ano, mes, dia } = req.params;
    // Obter horários agendados para o dia específico do banco de dados
    getHorariosAgendados(ano, mes, dia, (err, horariosAgendados) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter os horários agendados.' });
        }

        // Criar uma lista de todos os horários possíveis para o dia específico (por exemplo, das 8:00 às 18:00)
        const horariosDisponiveis = [];

        // Verificar se há horários agendados para este dia
        if (horariosAgendados.length > 0) {
            // Se houver horários agendados, consultar todos os horários possíveis
            for (let hora = 8; hora <= 18; hora++) {
                const horario = `${hora}:00`;

                // Verificar se o horário atual está na lista de horários agendados
                if (!horariosAgendados.includes(horario)) {
                    horariosDisponiveis.push(horario);
                }
            }
        } else {
            // Se não houver horários agendados, todos os horários estão disponíveis
            for (let hora = 8; hora <= 18; hora++) {
                const horario = `${hora}:00`;
                horariosDisponiveis.push(horario);
            }
        }

        // Enviar a lista de horários disponíveis como resposta
        res.json(horariosDisponiveis);
    });
});


// Rota para agendar um horário
app.post('/agendar', (req, res) => {
    const { nome, email, telefone, data, horario } = req.body;

    // Extrair dia, mês e ano da data
    const [dia, mes, ano] = data.split('/');

    // Inserir os dados na tabela do banco de dados
    // Chamar a função agendarHorario para inserir o agendamento no banco de dados
    agendarHorario(dia, mes, ano, horario, nome, email, telefone);
    res.status(200).send('Horário agendado com sucesso.');
});

// Rota para obter todos os agendamentos
app.get('/agendamentos', (req, res) => {
    // Consulta ao banco de dados para obter todos os agendamentos
    const db  = openDatabase();; // Importar a conexão com o banco de dados aqui
    db.all('SELECT * FROM horarios', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar os agendamentos:', err);
            res.status(500).json({ error: 'Erro ao buscar os agendamentos.' });
        } else {
            res.json(rows); // Enviar os agendamentos como resposta
        }
    });
});

// Criar a tabela de horários disponíveis, se não existir

createHorariosTable();

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
