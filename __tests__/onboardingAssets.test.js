import { icons } from '../src/constants/assets';

describe('onboarding assets', () => {
  it('exposes the onboarding image assets used by the onboarding screen', () => {
    expect(icons.code).toBeDefined();
    expect(icons.trophy).toBeDefined();
    expect(icons.student).toBeDefined();
  });
});
