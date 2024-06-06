import { CancellationToken, DuplexPipeline, Message, MessageMetadata, Pipeline, TypeCache } from '@electricui/core'
import { timing } from '@electricui/timing'

export type SMACMessageMetadata = {
  address: string
} & MessageMetadata

const carriageReturn = '\r'

export const carriageReturnBuffer = Buffer.alloc(1, 0x0d) // A single carriage return byte in a buffer

/**
 * The decoder pipeline buffers bytes until a carriage return is reached, then passes
 * that data to the decode function.
 */
export class SMACDecoderPipeline extends Pipeline {
  private buffer = Buffer.alloc(0)

  /**
   * Take a 'framed' buffer, between carriage returns and decode it.
   */
  private decode(packet: Buffer): Message<number | null, SMACMessageMetadata> | null {
    // Attempt a packet decode
    const str = packet.toString('ascii').trim()

    // console.log(`decoding`, str)

    const split = str.split(' ')
    const address = split[0]
    const messageType = split[1]
    const objectID = split[2]

    if (messageType === 'W') {
      // 0x20 W 0x6064 1234
      // [0] [1]   [2]  [3]
      const value = split[3]

      const message = new Message<number, SMACMessageMetadata>(objectID, Number(value))
      message.metadata.query = false
      message.metadata.address = address
      message.metadata.timestamp = timing.now()

      return message
    } else if (messageType === 'R') {
      // 0x20 R 0x6064
      // [0] [1]   [2]
      const message = new Message<null, SMACMessageMetadata>(objectID, null)
      message.metadata.query = true
      message.metadata.address = address
      message.metadata.timestamp = timing.now()

      console.warn(`UI received a read packet`, packet.toString('ascii'))

      return message
    } else {
      console.error(`Error decoding packet, unknown message type '${messageType}'`, packet.toString('ascii'))
      return null
    }
  }

  /**
   * Buffer bytes until a carriage return is detected.
   */
  public async receive(packet: Buffer, cancellationToken: CancellationToken) {
    const promises: Array<Promise<void>> = []

    let data = Buffer.concat([this.buffer, packet])
    let position

    while ((position = data.indexOf(carriageReturnBuffer)) !== -1) {
      const framed = data.slice(0, position)

      if (framed.length > 0) {
        const decoded = this.decode(framed)
        if (decoded) {
          promises.push(this.push(decoded, cancellationToken))
        }
      }
      data = data.slice(position + 1)
    }

    this.buffer = data

    await Promise.all(promises)
  }
}

export class SMACEncoderPipeline extends Pipeline {
  public receive(message: Message<number, SMACMessageMetadata>, cancellationToken: CancellationToken) {
    const address = message.metadata.address ?? '0x00'
    const query = message.metadata.query
    const messageType = message.metadata.query ? 'R' : 'W'
    const payload = query ? `` : ` ${message.payload}`
    const objectID = message.messageID

    // Encode the packet via string manipulation
    const packet = `${address} ${messageType} ${objectID}${payload}${carriageReturn}`

    // console.log(`writing packet ${packet}`)

    return this.push(packet, cancellationToken)
  }
}

/**
 * The duplex pipeline combines the encoder and decoder.
 */
export class SMACPipeline extends DuplexPipeline {
  readPipeline: SMACDecoderPipeline
  writePipeline: SMACEncoderPipeline
  constructor() {
    super()

    this.readPipeline = new SMACDecoderPipeline()
    this.writePipeline = new SMACEncoderPipeline()
  }
}
