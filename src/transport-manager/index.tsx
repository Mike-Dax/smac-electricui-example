import 'source-map-support/register'

import { deviceManager } from './config'
import { setupProxyAndDebugInterface } from '@electricui/components-desktop-blueprint'
import { setupTransportWindow } from '@electricui/utility-electron'
import {
  ElectronIPCRemoteQueryExecutor,
  MultiPersistenceEngineMemory,
  QueryableMessageIDProvider,
} from '@electricui/core-timeseries'

import './styles.css'

import { FocusStyleManager } from '@blueprintjs/core'
import { SMACMessageMetadata } from './config/smac'
import { Message } from '@electricui/core'
FocusStyleManager.onlyShowFocusOnTabs()

const root = document.createElement('div')
document.body.appendChild(root)

const hotReloadHandler = setupProxyAndDebugInterface(root, deviceManager)
setupTransportWindow()

const multiPersistenceEngine = new MultiPersistenceEngineMemory()
const remoteQueryExecutor = new ElectronIPCRemoteQueryExecutor(multiPersistenceEngine)
const queryableMessageIDProvider = new QueryableMessageIDProvider(deviceManager, multiPersistenceEngine)

// Tag all incoming messages with their address when ingesting into the persistence engine
queryableMessageIDProvider.setDefaultCustomMessageProcessor((message: Message<number, SMACMessageMetadata>, api) => {
  api.emit(message.metadata.timestamp, message.payload, { address: message.metadata.address })
})

if (module.hot) {
  module.hot.accept('./config', () => hotReloadHandler(root, deviceManager))
}
