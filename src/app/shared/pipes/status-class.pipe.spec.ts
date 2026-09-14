import { StatusClassPipe } from './status-class.pipe';

describe('StatusClassPipe', () => {
  const pipe = new StatusClassPipe();

  it('should map known statuses to Tailwind classes', () => {
    expect(pipe.transform('OPEN')).toBe('bg-blue-100 text-blue-800');
    expect(pipe.transform('IN_PROGRESS')).toBe('bg-yellow-100 text-yellow-800');
    expect(pipe.transform('RESOLVED')).toBe('bg-green-100 text-green-800');
  });

  it('should fall back to the default class for unknown statuses', () => {
    expect(pipe.transform('WHATEVER')).toBe('bg-gray-100 text-gray-800');
  });
});
