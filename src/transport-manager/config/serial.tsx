import {
  ConnectionInterface,
  ConnectionStaticMetadataReporter,
  DeliverabilityManagerOneShot,
  DiscoveryHintConsumer,
  Hint,
  QueryManagerNone,
  TransportFactory,
} from '@electricui/core'
import {
  SerialPortHintConfiguration,
  SerialPortHintIdentification,
  SerialTransport,
  SerialTransportOptions,
} from '@electricui/transport-node-serial'

import { SerialPort } from 'serialport'
import { SMACPipeline } from './smac'

// Serial Ports
const serialTransportFactory = new TransportFactory((options: SerialTransportOptions) => {
  const connectionInterface = new ConnectionInterface()

  const transport = new SerialTransport(options)

  const deliverabilityManager = new DeliverabilityManagerOneShot(connectionInterface)

  const queryManager = new QueryManagerNone(connectionInterface)

  const connectionStaticMetadata = new ConnectionStaticMetadataReporter({
    name: 'Serial',
    baudRate: options.baudRate,
    comPath: options.path,
  })

  const protocolPipeline = new SMACPipeline()

  connectionInterface.setTransport(transport)
  connectionInterface.setQueryManager(queryManager)
  connectionInterface.setDeliverabilityManager(deliverabilityManager)
  connectionInterface.setPipelines([protocolPipeline])
  connectionInterface.addMetadataReporters([connectionStaticMetadata])

  return connectionInterface.finalise()
})

const serialConsumer = new DiscoveryHintConsumer({
  factory: serialTransportFactory,
  canConsume: (hint: Hint<SerialPortHintIdentification, SerialPortHintConfiguration>) => {
    if (hint.getTransportKey() === 'serial') {
      // If you wanted to filter for specific serial devices, you would modify this section, removing the
      // return statement below and uncommenting the block below it, modifying it to your needs.

      const identification = hint.getIdentification()

      // Filter out any /dev/ttyS____ comPaths since they're almost certainly terminals
      if (identification.path.startsWith('/dev/ttyS')) {
        return false
      }

      // An example of filtering devices with Arduino or Silicon in the manufacturers
      /*
      return (
        identification.manufacturer && (
          identification.manufacturer.includes('Arduino') ||
          identification.manufacturer.includes('Silicon'))
      )
      */

      // Try any device that isn't filtered out by this stage
      return true
    }
    return false
  },
  configure: (hint: Hint) => {
    const identification = hint.getIdentification()
    const configuration = hint.getConfiguration()

    const options: SerialTransportOptions = {
      SerialPort,
      path: identification.path,
      baudRate: configuration.baudRate,
      // if you have an Arduino that resets on connection, uncomment this line to delay the connection
      // attachmentDelay: 2500,
    }

    return options
  },
})

export { serialConsumer }
