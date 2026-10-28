import type { EnvBindings } from '../../types/database.ts';
import type { FulfillmentProvider } from './types.ts';
import { Slant3DFulfillmentProvider } from './slant3d.ts';
import { MockFulfillmentProvider } from './mock.ts';

export * from './types.ts';
export * from './slant3d.ts';
export * from './mock.ts';

let cachedMockProvider: MockFulfillmentProvider | null = null;

/**
 * Returns the active fulfillment provider based on environment variables.
 * Falls back safely to Mock provider when live keys are absent or MOCK_SERVICES=true.
 */
export function getFulfillmentProvider(env: EnvBindings): FulfillmentProvider {
  const isMock = env.MOCK_SERVICES === 'true' || 
                 env.FULFILLMENT_PROVIDER === 'mock' || 
                 !env.SLANT3D_API_KEY;

  if (isMock) {
    if (!cachedMockProvider) {
      cachedMockProvider = new MockFulfillmentProvider();
    }
    return cachedMockProvider;
  }

  return new Slant3DFulfillmentProvider({
    apiKey: env.SLANT3D_API_KEY!,
    apiUrl: env.SLANT3D_API_URL
  });
}
