export class Cenario {
  public mapa: Array<Array<string>>;

  constructor(mapa?: Array<Array<string>>) {
    this.mapa = mapa || [];
  }
}