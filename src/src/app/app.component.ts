import { Component, ViewChild, ElementRef } from '@angular/core';

/* Imports de terceiros. */
import { imagens } from './util/imagens';
import { simbolos } from './util/simbolos';
import { copia } from './util/copia';
import { Cenario } from './models/cenario';

declare var $: any;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /** Declaração de variáveis privadas. */
  private _dia = 0;
  private _diaPrimeiroAeroportoAtingido;
  private _diaUltimoAeroportoAtingido;

  /** Declaração de variáveis públicas. */
  public elementoSelecionado: string;
  public cenarios: Array<Array<Array<string>>> = new Array();
  public novoElemento = {
    simbolo: "A",
    linha: -1,
    coluna: -1
  };

  /** Declaração de variáveis públicas com get e set. */
  public get simbolos() {
    return simbolos;
  }
  public get diaPrimeiroAeroportoAtingido() {
    return this._diaPrimeiroAeroportoAtingido;
  }
  public set diaPrimeiroAeroportoAtingido(valor: number) {
    if (!this._diaPrimeiroAeroportoAtingido)
      this._diaPrimeiroAeroportoAtingido = valor;
  }
  public get diaUltimoAeroportoAtingido() {
    return this._diaUltimoAeroportoAtingido;
  }
  public set diaUltimoAeroportoAtingido(valor: number) {
    if (!this._diaUltimoAeroportoAtingido)
      this._diaUltimoAeroportoAtingido = valor;
  }
  public get dia() {
    return this._dia + 1;
  }
  public get qtdLinhas() {
    return this.cenarioAtual.length;
  }
  public get qtdColunas() {
    return this.cenarioAtual[0].length;
  }
  public get cenarioAtual() {
    return this.cenarios[this._dia];
  }
  public set cenarioAtual(valor) {
    this.cenarios[this._dia] = valor;
  }


  /* Cria o component e o cenário inicial. */
  constructor() {
    this.criarCenarioInicial();
  }

  /** Cria o cenário inicial da aplicação. */
  criarCenarioInicial() {
    this.cenarioAtual =
      [
        ['.', '.', '*', '.', '.', '.', '*', '*'],
        ['.', '*', '*', '.', '.', '.', '.', '.'],
        ['*', '*', '*', '.', 'A', '.', '.', 'A'],
        ['.', '*', '.', '.', '.', '.', '.', '.'],
        ['.', '*', '.', '.', '.', '.', 'A', '.'],
        ['.', '.', '.', 'A', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.']
      ];
  }

  /* Cria um novo cenário de acordo com o cenário anterior. */
  criarCenario() {
    /* Realiza a cópia do cenário atual desvinculando a ref. do objeto. */
    let cenario = copia(this.cenarioAtual);

    /* Adiciona um novo cenário. */
    this.cenarios.push(copia(this.cenarioAtual));

    /* Avança um dia para frente, alterando o cenário atual para o dia seguinte. */
    this.avancarDia();

    /** Percorre todas as linhas e colunas do cenário antigo para expandir as nuvens do cenário atual. */
    for (var linha = 0; linha < this.qtdLinhas; linha++) {
      for (var coluna = 0; coluna < this.qtdColunas; coluna++) {
        /* Expande as nuvens a partir de outras nuvens ou de aeroportos atingidos. */
        if (this.ehNuvem(cenario[linha][coluna]) || this.ehAeroportoAtingido(cenario[linha][coluna])) {
          this.expandirNuvem(this.cenarioAtual, linha, coluna);
        }
      }
    }
  }

  /* Expande uma nuvem de acordo com o seu cenário. */
  expandirNuvem(cenario: Array<Array<string>>, linha: number, coluna: number) {

    /* Expandir para cima */
    if (linha - 1 >= 0)
      if (this.ehAeroporto(cenario[linha - 1][coluna])) {
        cenario[linha - 1][coluna] = this.simbolos.aeroportoAtingido;
        this.marcarDiaPrimeiroAeroportoAtingido();
      }
      else {
        cenario[linha - 1][coluna] = this.simbolos.nuvem;
      }

    /* Expandir para baixo */
    if (linha + 1 < this.qtdLinhas)
      if (this.ehAeroporto(cenario[linha + 1][coluna])) {
        cenario[linha + 1][coluna] = this.simbolos.aeroportoAtingido;
        this.marcarDiaPrimeiroAeroportoAtingido();
      }
      else {
        cenario[linha + 1][coluna] = this.simbolos.nuvem;
      }

    /* Expandir para esquerda */
    if (coluna - 1 >= 0)
      if (this.ehAeroporto(cenario[linha][coluna - 1])) {
        cenario[linha][coluna - 1] = this.simbolos.aeroportoAtingido;
        this.marcarDiaPrimeiroAeroportoAtingido();
      }
      else {
        cenario[linha][coluna - 1] = this.simbolos.nuvem;
      }

    /* Expandir para direita */
    if (coluna + 1 < this.qtdColunas)
      if (this.ehAeroporto(cenario[linha][coluna + 1])) {
        cenario[linha][coluna + 1] = this.simbolos.aeroportoAtingido;
        this.marcarDiaPrimeiroAeroportoAtingido();
      }
      else {
        cenario[linha][coluna + 1] = this.simbolos.nuvem;
      }
  }

  /* Calcula o número de dias necessários para que a nuvem cubra todos os aeroportos. */
  calcularDias() {
    while (this.existeAeroporto()) {
      this.criarCenario();
    }
    this.marcarDiaUltimoAeroportoAtingido();
  }

  /* Volta ao cenário padrão que é criado quando a página inicializa. */
  redefinir() {
    this._dia = 0;
    this.cenarios = new Array();
    this._diaPrimeiroAeroportoAtingido = null;
    this._diaUltimoAeroportoAtingido = null;

    this.criarCenarioInicial();
  }

  /* Adiciona um elemento ao cenário atual. */
  adicionarElemento(elemento) {
    if (elemento)
      this.cenarioAtual[elemento.linha][elemento.coluna] = elemento.simbolo;

    this.fecharModal('#addElementoModal');
  }

  /* Abre o modal para adicionar um novo elemento. */
  abrirModalAddElemento(linha: number, coluna: number) {
    this.novoElemento.linha = linha;
    this.novoElemento.coluna = coluna;

    /* Abre o modal de escolha do elemento */
    this.abrirModal('#addElementoModal');
  }

  /** Abre o modal do bootstrap que corresponde ao id de parâmetro */
  abrirModal(id: string) {
    $(id).modal('show');
  }

  /** Fecha o modal do bootstrap que corresponde ao id de parâmetro */
  fecharModal(id: string) {
    $(id).modal('hide');
  }

  /* Marca o dia em que o primeiro aeroporto foi atingido pelas nuvens. */
  marcarDiaPrimeiroAeroportoAtingido() {
    this.diaPrimeiroAeroportoAtingido = this.dia;
  }

  /* Marca o dia em que o ultimo aeroporto foi atingido pelas nuvens. */
  marcarDiaUltimoAeroportoAtingido() {
    this.diaUltimoAeroportoAtingido = this.dia;
  }

  /** Altera o cenário atual para o cenário do dia passado como parâmetro */
  visualizarCenario(dia) {
    this._dia = dia;
  }

  /* Obtém a imagem correspondente ao símbolo. */
  obterImagem(valor) {
    if (this.ehAeroporto(valor))
      return imagens.aeroporto;

    if (this.ehNuvem(valor))
      return imagens.nuvem;

    if (this.ehAeroportoAtingido(valor))
      return imagens.aeroportoAtingido;

    return imagens.padrao;
  }

  /* Anda um dia para frente. */
  avancarDia() {
    this._dia++;
  }

  existeAeroporto() {
    /** Percorre todas as linhas e colunas para verificar se ainda existem aeroportos. */
    for (var linha = 0; linha < this.qtdLinhas; linha++) {
      for (var coluna = 0; coluna < this.qtdColunas; coluna++) {
        if (this.ehAeroporto(this.cenarioAtual[linha][coluna])) {
          return true;
        }
      }
    }
    return false;
  }

  /** Verifica se valor do parâmetro é um aeroporto. */
  ehAeroporto(valor: string) {
    return valor === this.simbolos.aeroporto;
  }

  /** Verifica se valor do parâmetro é uma nuvem. */
  ehNuvem(valor: string) {
    return valor === this.simbolos.nuvem;
  }

  /** Verifica se valor do parâmetro é um aeroporto atingido. */
  ehAeroportoAtingido(valor: string) {
    return valor === this.simbolos.aeroportoAtingido;
  }
}
