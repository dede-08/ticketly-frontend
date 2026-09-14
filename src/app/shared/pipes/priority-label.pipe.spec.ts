import { PriorityLabelPipe } from './priority-label.pipe';

describe('PriorityLabelPipe', () => {
  const pipe = new PriorityLabelPipe();

  it('should translate known priorities', () => {
    expect(pipe.transform('LOW')).toBe('Baja');
    expect(pipe.transform('CRITICAL')).toBe('Crítica');
  });

  it('should return the input for unknown priorities', () => {
    expect(pipe.transform('WHATEVER')).toBe('WHATEVER');
  });
});
