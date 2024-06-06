/**
 * To strictly type all accessors and writers, remove
 *
 * [messageID: string]: any
 *
 * And replace with your entire state shape after codecs have decoded them.
 */
declare global {
  interface ElectricUIDeveloperState {
    [messageID: string]: any
  }
  interface ElectricUIDeviceMetadataState {}
}

// This exports these types into the dependency tree.
export {}
