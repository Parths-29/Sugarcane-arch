// Advisory algorithm unit tests - test FAO-56 logic directly
describe('Advisory algorithm', () => {
  const KC: Record<string, number> = {
    germination: 0.40,
    tillering: 0.75,
    grand_growth: 1.25,
    maturity: 0.75,
  };

  function waterNeed(stage: string, et0: number, rain3d: number, soilPct: number): number {
    const kc = KC[stage] ?? 0.75;
    const etc = et0 * kc;
    const effRain = 0.8 * rain3d;
    const soilContrib = (soilPct / 100) * 20;
    return etc - effRain - soilContrib;
  }

  test('germination stage: low et0 no rain low moisture → positive need', () => {
    const need = waterNeed('germination', 5, 0, 10);
    expect(need).toBeGreaterThan(0);
  });

  test('grand_growth: high et0, no rain, low moisture → high need', () => {
    const need = waterNeed('grand_growth', 8, 0, 20);
    expect(need).toBeGreaterThan(10);
  });

  test('skip scenario: saturated soil, heavy rain', () => {
    const need = waterNeed('tillering', 5, 30, 90);
    expect(need).toBeLessThan(0);
  });

  test('delay scenario: moderate need, rain coming', () => {
    const need = waterNeed('maturity', 5, 10, 40);
    // effectiveRain=8 covers a lot
    expect(need).toBeLessThan(5);
  });

  test('Kc values are correct', () => {
    expect(KC.germination).toBe(0.40);
    expect(KC.tillering).toBe(0.75);
    expect(KC.grand_growth).toBe(1.25);
    expect(KC.maturity).toBe(0.75);
  });
});
