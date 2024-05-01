function criarCalendario(ano, mes) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const numDiasMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay(); // 0 (Dom) a 6 (Sáb)

    const calendario = document.createElement('table');
    const cabecalhoMes = document.createElement('tr');
    const nomeMes = document.createElement('th');
    nomeMes.colSpan = 7;
    nomeMes.textContent = meses[mes] + ' ' + ano;
    cabecalhoMes.appendChild(nomeMes);
    calendario.appendChild(cabecalhoMes);

    const cabecalho = document.createElement('tr');

    // Cabeçalho do calendário com os dias da semana
    diasSemana.forEach(dia => {
        const th = document.createElement('th');
        th.textContent = dia;
        cabecalho.appendChild(th);
    });

    calendario.appendChild(cabecalho);

    // Preencher os dias do mês no calendário
    let diaAtual = 1;
    for (let i = 0; i < 6; i++) { // 6 linhas para os dias (pode haver no máximo 6 semanas)
        const linha = document.createElement('tr');
        for (let j = 0; j < 7; j++) { // 7 colunas para os dias da semana
            const celula = document.createElement('td');
            if (i === 0 && j < primeiroDiaSemana) {
                // células vazias antes do primeiro dia do mês
                linha.appendChild(celula);
            } else if (diaAtual > numDiasMes) {
                // após o último dia do mês, deixe as células restantes vazias
                break;
            } else {
                celula.textContent = diaAtual;
                linha.appendChild(celula);
                diaAtual++;
            }
        }
        calendario.appendChild(linha);
    }

    return calendario;
}


// Função para avançar para o próximo mês
function avancarMes() {
    if (mes < 11) {
        mes++;
    } else {
        mes = 0;
        ano++;
    }
    atualizarCalendario();
}

// Função para retroceder para o mês anterior
function retrocederMes() {
    if (mes > 0) {
        mes--;
    } else {
        mes = 11;
        ano--;
    }
    atualizarCalendario();
}

// Função para atualizar o calendário na página
function atualizarCalendario() {
    const novoCalendario = criarCalendario(ano, mes);
    const calendarioExistente = document.getElementById('calendario-container');
    calendarioExistente.innerHTML = ''; // Limpa o conteúdo existente
    calendarioExistente.appendChild(novoCalendario);

    // Adiciona eventos de clique aos dias da semana
    const diasMes = novoCalendario.querySelectorAll('td');
    diasMes.forEach((dia) => {
        dia.addEventListener('click', (event) => {
            const diaSelecionado = parseInt(event.target.textContent); // Armazena o dia selecionado na variável global
            exibirHorariosDisponiveis(diaSelecionado, mes, ano);
        });
    });
}


let ano = new Date().getFullYear();
let mes = new Date().getMonth();

// Chamada inicial para criar o calendário do mês atual
document.addEventListener('DOMContentLoaded', () => {
    atualizarCalendario();
});

// Função para exibir os horários disponíveis na tela
function exibirHorariosDisponiveis(dia, mes, ano) {
    // Incrementar o valor do mês em 1 para o próximo mês
    const corrigindoMes = mes + 1;
    // Construir a URL da API com os parâmetros de data
    const url = `http://localhost:3000/horarios/${ano}/${corrigindoMes}/${dia}`;

    // Fazer uma requisição GET para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao obter os horários.');
            }
            return response.json();
        })
        .then(data => {
            abrirModal(data, dia, mes, ano);
        })
        .catch(error => {
            console.error(error.message);
        });
}

// Função para abrir o modal de agendamento com os horários disponíveis
function abrirModal(horariosDisponiveis, diaSelecionado, mesSelecionado, anoSelecionado) {
    const modal = document.getElementById('modal');
    const horariosContainer = document.getElementById('horarios-disponiveis-container');
    const dataSelecionadaElemento = document.getElementById('data-selecionada');

    // Atualiza o texto com a data e o número do dia selecionado
    const dataFormatada = formatarData(`${diaSelecionado}/${mesSelecionado + 1}/${anoSelecionado}`);
    dataSelecionadaElemento.textContent = `Agendar horário para o dia ${dataFormatada}`;


    // Limpar o conteúdo anterior
    horariosContainer.innerHTML = '';

    // Criar um botão de seleção para cada horário disponível
    horariosDisponiveis.forEach(horario => {
        const botaoSelecao = document.createElement('button');
        botaoSelecao.textContent = horario;
        botaoSelecao.classList.add('horario');
        botaoSelecao.addEventListener('click', () => {
            // Remove a classe 'selecionado' de todos os horários
            const horarios = document.querySelectorAll('.horario');
            horarios.forEach(horario => {
                horario.classList.remove('selecionado');
            });

            // Adiciona a classe 'selecionado' apenas ao horário clicado
            botaoSelecao.classList.add('selecionado');
        });
        horariosContainer.appendChild(botaoSelecao);
    });

    // Exibir o modal
    modal.style.display = 'block';
}



// Quando o usuário clicar no botão "Fechar" (x), fechar o modal
document.querySelector('.close').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});

// Quando o usuário clicar fora do modal, fechar o modal
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Quando o usuário submeter o formulário de agendamento, processar o agendamento
document.getElementById('agendamento-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Evita que o formulário seja enviado

    // Recupera o horário selecionado, se existir
    const horarioSelecionado = document.querySelector('.horario.selecionado');

    // Verifica se um horário foi selecionado
    if (!horarioSelecionado) {
        // Se nenhum horário foi selecionado, exibe um alerta para o usuário
        alert('Por favor, selecione um horário para agendar o serviço.');
        return; // Sai da função sem enviar o formulário
    }

    // Recupera os valores do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const diaAgendadoCompleto = document.getElementById('data-selecionada').textContent; // Obtém a data agendada
    const diaAgendado = diaAgendadoCompleto.match(/\d{1,2}\/\d{1,2}\/\d{4}/)[0]; // Extrai apenas a data no formato "dia/mês/ano"
    const horarioAgendado = document.querySelector('.horario.selecionado').textContent; // Obtém o horário agendado

    // Exemplo de como enviar os dados para a API (substitua com a lógica real)
    const dadosAgendamento = {
        nome: nome,
        email: email,
        telefone: telefone,
        data: diaAgendado,
        horario: horarioAgendado
    };
    console.log('Dados do agendamento:', dadosAgendamento);

    // Aqui você pode enviar os dados para a API para processar o agendamento
    fetch('http://localhost:3000/agendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosAgendamento)
    })
    .then(response => {
        if (response.ok) {
            console.log('Horário agendado com sucesso.');
        } else {
            throw new Error('Erro ao agendar o serviço.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });

    // Fechar o modal após o envio do formulário
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
});



// Função para atualizar o calendário na página
function atualizarCalendario() {
    const novoCalendario = criarCalendario(ano, mes);
    const calendarioExistente = document.getElementById('calendario-container');
    calendarioExistente.innerHTML = ''; // Limpa o conteúdo existente
    calendarioExistente.appendChild(novoCalendario);

    // Adiciona eventos de clique aos dias da semana
    const diasMes = novoCalendario.querySelectorAll('td');
    diasMes.forEach((dia) => {
        dia.addEventListener('click', (event) => {
            const diaSelecionado = parseInt(event.target.textContent); // Obtém o dia clicado
            exibirHorariosDisponiveis(diaSelecionado, mes, ano);
        });
    });
}

// Chamada inicial para criar o calendário do mês atual
document.addEventListener('DOMContentLoaded', () => {
    atualizarCalendario();
});

// Função para formatar a data para o padrão "dd/mm/aaaa"
function formatarData(data) {
    const [dia, mes, ano] = data.split('/');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
}