import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildExplainPrompt, explainSimply, promptAvailability, translateToHindi, translatorAvailability } from '../../src/ui/ai';
import { SCAM_VERDICT } from './helpers';

const g = globalThis as Record<string, unknown>;

afterEach(() => {
  delete g.LanguageModel;
  delete g.Translator;
});

describe('optional on-device AI', () => {
  it('reports unavailable when the browser has no built-in AI', async () => {
    expect(await promptAvailability()).toBe('unavailable');
    expect(await translatorAvailability()).toBe('unavailable');
    await expect(explainSimply(SCAM_VERDICT, 'x')).rejects.toThrow();
  });

  it('survives an API that throws', async () => {
    g.LanguageModel = { availability: () => Promise.reject(new Error('blocked')), create: vi.fn() };
    expect(await promptAvailability()).toBe('unavailable');
  });

  it('asks the Prompt API with the verdict and destroys the session', async () => {
    const destroy = vi.fn();
    const prompt = vi.fn(async (_input: string) => 'This message is a trick — do not click.');
    const create = vi.fn(async () => ({ prompt, destroy }));
    g.LanguageModel = { availability: async () => 'available', create };
    expect(await promptAvailability()).toBe('available');
    const answer = await explainSimply(SCAM_VERDICT, 'Your KYC expired, click http://x.top');
    expect(answer).toBe('This message is a trick , do not click.');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ initialPrompts: [expect.objectContaining({ role: 'system' })] }));
    expect(prompt.mock.calls[0]![0]).toContain('Very likely a KYC update scam');
    expect(destroy).toHaveBeenCalled();
  });

  it('translates with the Translator API', async () => {
    const destroy = vi.fn();
    g.Translator = {
      availability: async () => 'downloadable',
      create: async () => ({ translate: async (t: string) => `हिंदी: ${t}`, destroy }),
    };
    expect(await translatorAvailability('en', 'hi')).toBe('downloadable');
    expect(await translateToHindi('Hello')).toBe('हिंदी: Hello');
    expect(destroy).toHaveBeenCalled();
  });

  it('builds a prompt that carries signals but trims long messages', () => {
    const prompt = buildExplainPrompt(SCAM_VERDICT, 'y'.repeat(5000));
    expect(prompt).toContain('Asks you to update KYC through a link');
    expect(prompt.length).toBeLessThan(2200);
  });
});
