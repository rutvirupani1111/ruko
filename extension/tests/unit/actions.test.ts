import { describe, expect, it } from 'vitest';
import { standardActions, verdictActions } from '../../src/shared/actions';

describe('verdictActions', () => {
  it('always offers 1930, cybercrime.gov.in and Chakshu when money may be at risk, 1930 first', () => {
    const actions = verdictActions(
      [{ id: 'bank', title: 'Call your bank', detail: '', action: { label: 'Call bank', href: 'tel:18001234' } }],
      'critical',
      'en',
    );
    expect(actions.map((a) => a.href)).toEqual(['tel:1930', 'tel:18001234', 'https://cybercrime.gov.in', 'https://sancharsaathi.gov.in/sfc/']);
  });

  it('keeps the engine label when it already offers the same action', () => {
    const actions = verdictActions(
      [{ id: '1930', title: 'Call now', detail: '', action: { label: 'Call 1930 now', href: 'tel:1930' }, urgent: true }],
      'high',
      'en',
    );
    expect(actions.filter((a) => a.href === 'tel:1930')).toEqual([{ label: 'Call 1930 now', href: 'tel:1930' }]);
  });

  it('adds nothing extra for medium or safe verdicts and drops unsafe links', () => {
    expect(verdictActions([], 'medium', 'en')).toEqual([]);
    expect(
      verdictActions([{ id: 'x', title: 'x', detail: '', action: { label: 'Bad', href: 'javascript:alert(1)' } }], 'safe', 'en'),
    ).toEqual([]);
  });

  it('labels the standard actions in Hindi', () => {
    expect(standardActions('hi')[0]).toEqual({ label: '1930 पर कॉल करें', href: 'tel:1930' });
  });
});
