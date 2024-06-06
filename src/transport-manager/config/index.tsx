import {
  CancellationToken,
  Connection,
  Device,
  DeviceManager,
  Hint,
  MessageQueueSimpleConcurrency,
  MessageRouterLastReceived,
  hotReloadDeviceManager,
} from '@electricui/core'
import { serialConsumer } from './serial'
import { SerialPort } from 'serialport'

import {
  HintValidatorSerialComPath,
  SERIAL_TRANSPORT_KEY,
  SerialPortHintProducerManual,
} from '@electricui/transport-node-serial'

/**
 * Create our device manager!
 */
export const deviceManager = new DeviceManager()

function createRouter(device: Device) {
  const router = new MessageRouterLastReceived(device)

  return router
}

function createQueue(device: Device) {
  return new MessageQueueSimpleConcurrency(device, 1)
}

function hintValidators(hint: Hint, connection: Connection, cancellationToken: CancellationToken) {
  // Serial
  if (hint.getTransportKey() === SERIAL_TRANSPORT_KEY) {
    const validator = new HintValidatorSerialComPath(hint, connection, cancellationToken)

    return [validator]
  }

  return []
}

function createHandshakes(device: Device, cancellationToken: CancellationToken) {
  return []
}

const manualSerialHintProducer = new SerialPortHintProducerManual({ SerialPort })

deviceManager.setCreateHintValidatorsCallback(hintValidators)
deviceManager.addHintProducers([manualSerialHintProducer])
deviceManager.addHintConsumers([serialConsumer])
deviceManager.setCreateRouterCallback(createRouter)
deviceManager.setCreateQueueCallback(createQueue)
deviceManager.setCreateHandshakesCallback(createHandshakes)

// start polling immediately, poll for 10 seconds
const cancellationToken = new CancellationToken('inital poll').deadline(10_000)
deviceManager.poll(cancellationToken).catch(err => {
  if (cancellationToken.caused(err)) {
    console.log("Didn't find any devices on initial poll")
  }
})

const [dispose, refresh] = hotReloadDeviceManager(deviceManager)

if (module.hot) {
  module.hot.dispose(dispose)
  refresh(module.hot.data)
}
