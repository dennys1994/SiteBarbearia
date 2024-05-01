const sqlite3 = require('sqlite3').verbose();

// Função para abrir o banco de dados
function openDatabase() {
    return new sqlite3.Database('agenda.db');
}

// Função para criar a tabela de horários disponíveis, se não existir
function createHorariosTable() {
    const db = openDatabase();

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS horarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dia INTEGER,
            mes INTEGER,
            ano INTEGER,
            horario TEXT,
            nome TEXT,
            email TEXT,
            telefone TEXT
        )`);
    });

    db.close();
}

// Função para inserir um agendamento no banco de dados
function agendarHorario(dia, mes, ano, horario, nome, email, telefone) {
    const db = openDatabase();

    db.run(`INSERT INTO horarios (dia, mes, ano, horario, nome, email, telefone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dia, mes, ano, horario, nome, email, telefone], (err) => {
            if (err) {
                console.error('Erro ao agendar horário:', err);
            } else {
                console.log('Horário agendado com sucesso.');
            }
        });

    db.close();
}

// Função para obter os horários agendados para um dia específico
function getHorariosAgendados(ano, mes, dia, callback) {
    // Conectar-se ao banco de dados
    const db = openDatabase();

    // Criar a consulta SQL para selecionar os horários agendados para o dia específico
    const sql = `SELECT horario FROM horarios WHERE ano = ? AND mes = ? AND dia = ?`;

    // Executar a consulta SQL
    db.all(sql, [ano, mes, dia], (err, rows) => {
        if (err) {
            // Se houver um erro, chame a função de retorno de chamada com o erro
            callback(err, null);
        } else {
            // Processar os resultados da consulta
            const horariosAgendados = rows.map(row => row.horario);    
            // Chame a função de retorno de chamada com os horários agendados
            callback(null, horariosAgendados);
        }
    });

    // Fechar a conexão com o banco de dados
    db.close();
}

module.exports = { openDatabase, createHorariosTable, agendarHorario, getHorariosAgendados  };
