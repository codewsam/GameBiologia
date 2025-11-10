// script.js - lógica das perguntas (Verdadeiro ou Falso)

// ---- Exemplo de perguntas ----
// Cada pergunta tem: texto, resposta (true => Verdadeiro, false => Falso), peso (3 | 4 | 5)
const perguntas = [
  { texto: "O Sol é uma estrela.", resposta: true, peso: 3 },
  { texto: "A água ferve a 50°C ao nível do mar.", resposta: false, peso: 4 },
  { texto: "O Brasil é maior que a Rússia em extensão territorial.", resposta: false, peso: 5 },
  { texto: "O português é a língua oficial do Brasil.", resposta: true, peso: 3 },
  // adicione quantas perguntas quiser...
];

// estado do jogo
let equipeIndex = 0; // 0 ou 1
let equipes = ["Equipe 1", "Equipe 2"];
let placar = [0, 0];
let indicePergunta = 0;
let ultimaRespostaCorreta = false; // flag para controle de justificativa
let ultimaPerguntaPeso = 1;

// elementos DOM
const nomeEquipeAtualEl = document.getElementById("nomeEquipeAtual");
const placarTextEl = document.getElementById("placarText");
const perguntaTextoEl = document.getElementById("perguntaTexto");
const pesoPerguntaEl = document.getElementById("pesoPergunta");
const btnVerdadeiro = document.getElementById("btnVerdadeiro");
const btnFalso = document.getElementById("btnFalso");
const feedbackEl = document.getElementById("feedback");
const resultadoRespostaEl = document.getElementById("resultadoResposta");
const areaJustificativa = document.getElementById("areaJustificativa");
const enviarJust = document.getElementById("enviarJust");
const controlesModerador = document.getElementById("controlesModerador");
const justOk = document.getElementById("justOk");
const justBad = document.getElementById("justBad");
const proximaBtn = document.getElementById("proxima");
const placarFinal = document.getElementById("placarFinal");
const listaFinal = document.getElementById("listaFinal");
const reiniciarBtn = document.getElementById("reiniciar");
const areaDesafio = document.getElementById("areaDesafio");

// carregar equipes do localStorage (definido na tela de equipes)
function carregarEquipes() {
  const e1 = localStorage.getItem("equipe1");
  const e2 = localStorage.getItem("equipe2");
  if (e1) equipes[0] = e1;
  if (e2) equipes[1] = e2;
}

function atualizarPlacarDOM() {
  placarTextEl.textContent = `${equipes[0]}: ${placar[0]} — ${equipes[1]}: ${placar[1]}`;
}

function atualizarEquipeAtualDOM() {
  nomeEquipeAtualEl.textContent = equipes[equipeIndex];
}

// exibe pergunta atual
function mostrarPergunta() {
  feedbackEl.style.display = "none";
  areaJustificativa.style.display = "none";
  controlesModerador.style.display = "none";
  proximaBtn.style.display = "none";

  if (indicePergunta >= perguntas.length) {
    finalizarJogo();
    return;
  }
  const p = perguntas[indicePergunta];
  perguntaTextoEl.textContent = p.texto;
  pesoPerguntaEl.textContent = p.peso;
  ultimaPerguntaPeso = p.peso;
}

function handleResposta(chute) {
  // chute: boolean (true => Verdadeiro, false => Falso)
  const p = perguntas[indicePergunta];
  // bloqueia botões temporariamente
  btnVerdadeiro.disabled = true;
  btnFalso.disabled = true;

  if (chute === p.resposta) {
    // resposta correta: concede ponto base (1)
    ultimaRespostaCorreta = true;
    placar[equipeIndex] += 1; // ponto base
    atualizarPlacarDOM();

    resultadoRespostaEl.textContent = `Resposta correta! +1 ponto (pontuação base).`;
    feedbackEl.style.display = "block";

    // se peso > 1, permite justificativa para tentar ganhar peso total
    if (p.peso > 1) {
      areaJustificativa.style.display = "block";
    } else {
      // sem justificativa possível: próxima pergunta
      proximaBtn.style.display = "inline-block";
    }
  } else {
    // resposta errada
    ultimaRespostaCorreta = false;
    resultadoRespostaEl.textContent = `Resposta incorreta. 0 pontos.`;
    feedbackEl.style.display = "block";
    proximaBtn.style.display = "inline-block";
  }
}

function enviarJustificativaHandler() {
  // mostra controles do moderador para validar a justificativa
  controlesModerador.style.display = "block";
  areaJustificativa.style.display = "none";
}

// Moderador marca justificativa correta
function validarJustificativa(correta) {
  const p = perguntas[indicePergunta];
  // a justificativa só deve contar quando a resposta inicial foi correta
  if (!ultimaRespostaCorreta) {
    // segurança: não alterar nada
    controlesModerador.style.display = "none";
    proximaBtn.style.display = "inline-block";
    return;
  }

  // remover o ponto base que já foi dado e aplicar a pontuação correta:
  // se justificativa correta: garantir que a pontuação seja igual ao peso
  // se incorreta: manter 1 ponto (já dado)
  if (correta) {
    // substitui a pontuação base por valor do peso:
    // como já adicionamos +1 antes, adicionamos só o adicional (peso - 1)
    const extra = p.peso - 1;
    placar[equipeIndex] += extra;
    resultadoRespostaEl.textContent = `Justificativa validada: +${p.peso} pontos no total (peso ${p.peso}).`;
  } else {
    resultadoRespostaEl.textContent = `Justificativa inválida: permanece apenas +1 ponto (pontuação base).`;
  }

  atualizarPlacarDOM();
  controlesModerador.style.display = "none";
  proximaBtn.style.display = "inline-block";
}

// próxima pergunta (avança índice, alterna equipe)
function proximaPergunta() {
  indicePergunta++;
  // alterna equipe (0⇄1)
  equipeIndex = 1 - equipeIndex;

  // habilita botões novamente
  btnVerdadeiro.disabled = false;
  btnFalso.disabled = false;

  atualizarEquipeAtualDOM();
  mostrarPergunta();
}

// finaliza o jogo e mostra placar final
function finalizarJogo() {
  document.getElementById("perguntaContainer").style.display = "none";
  placarFinal.style.display = "block";

  listaFinal.innerHTML = `
    <li>${equipes[0]}: ${placar[0]} pontos</li>
    <li>${equipes[1]}: ${placar[1]} pontos</li>
  `;

  let vencedor = "";
  if (placar[0] > placar[1]) vencedor = equipes[0];
  else if (placar[1] > placar[0]) vencedor = equipes[1];
  else vencedor = "Empate";

  const li = document.createElement("li");
  li.style.marginTop = "12px";
  li.style.fontWeight = "bold";
  li.textContent = `Vencedor: ${vencedor}`;
  listaFinal.appendChild(li);
}

// reinicia tudo (recarrega a página)
function reiniciar() {
  localStorage.removeItem("equipe1");
  localStorage.removeItem("equipe2");
  // em vez de apagar equipes, só recarrega para voltar para equipes.html
  window.location.href = "index.html";
}

// ---- eventos ----
btnVerdadeiro.addEventListener("click", () => handleResposta(true));
btnFalso.addEventListener("click", () => handleResposta(false));
enviarJust.addEventListener("click", enviarJustificativaHandler);
justOk.addEventListener("click", () => validarJustificativa(true));
justBad.addEventListener("click", () => validarJustificativa(false));
proximaBtn.addEventListener("click", proximaPergunta);
reiniciarBtn.addEventListener("click", reiniciar);

// inicialização
function start() {
  carregarEquipes();
  atualizarPlacarDOM();
  atualizarEquipeAtualDOM();
  mostrarPergunta();
}

start();
