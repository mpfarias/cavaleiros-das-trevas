// Teste simples para verificar se o Jest está funcionando
describe('Teste Simples', () => {
  it('deve somar 2 + 2 corretamente', () => {
    expect(2 + 2).toBe(4);
  });

  it('deve verificar se uma string contém texto', () => {
    const texto = 'Cavaleiro das Trevas';
    expect(texto).toContain('Cavaleiro');
  });

  it('deve verificar se um array tem o tamanho correto', () => {
    const array = [1, 2, 3, 4, 5];
    expect(array).toHaveLength(5);
  });
});
