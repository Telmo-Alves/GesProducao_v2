describe('smoke', () => {
  it('runs a basic truthy assertion', () => {
    expect(true).toBe(true);
  });

  it('handles simple TypeScript features', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});

