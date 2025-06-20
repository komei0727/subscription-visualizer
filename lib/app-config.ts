/**
 * Application configuration
 * This file exports configuration that can be safely exposed to the client
 */

const isReadOnlyMode = process.env.READ_ONLY_MODE === 'true'

export const appConfig = {
  // Feature flags
  features: {
    registration: !isReadOnlyMode,
    dataModification: !isReadOnlyMode,
  },
  readOnlyMode: isReadOnlyMode,
}

/**
 * Get client-safe app configuration
 * This can be used in client components via props
 */
export function getClientConfig() {
  return {
    features: {
      registration: appConfig.features.registration,
      dataModification: appConfig.features.dataModification,
    },
    readOnlyMode: appConfig.readOnlyMode,
  }
}
