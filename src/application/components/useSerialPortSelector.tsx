import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CancellationToken } from '@electricui/async-utilities'
import { useDeviceManager } from '@electricui/components-core'
import { DeviceID } from '@electricui/core'
import {
  SerialPortHintIdentification,
  SerialPortHintProducerManualClient,
} from '@electricui/transport-node-serial'

const dSerialPortSelectorHook = require('debug')(
  'transport-node-serial-react:hook',
)

export function useSerialPortSelector(
  onSuccess?: (deviceID: DeviceID) => void,
) {
  const deviceManager = useDeviceManager()

  const [client] = useState(() => new SerialPortHintProducerManualClient())
  const [error, setError] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [ports, setPorts] = useState<SerialPortHintIdentification[]>([])
  const currentOperation = useRef<CancellationToken | null>(null)

  const [selectedPort, setSelectedPort] =
    useState<SerialPortHintIdentification | null>(null)

  // Teardown on removal
  useEffect(() => {
    dSerialPortSelectorHook(`Mounted`)
    return () => {
      dSerialPortSelectorHook(`Tearing down`)

      if (currentOperation.current) {
        currentOperation.current.cancel()
      }

      client.teardown()
    }
  }, [client])

  // Refresh callback
  const refresh = useCallback(async () => {
    if (currentOperation.current) {
      dSerialPortSelectorHook(`Cancelling current operation...`)

      currentOperation.current.cancel()
    }

    dSerialPortSelectorHook(`Refreshing`)

    const cancellationToken = new CancellationToken()
    currentOperation.current = cancellationToken

    setIsFetching(true)
    setError('')

    let ports: SerialPortHintIdentification[] = []

    try {
      ports = await client.requestPorts(cancellationToken)
      dSerialPortSelectorHook(`Received ${ports.length} ports`)
    } catch (err) {
      if (cancellationToken.caused(err)) {
        return
      }
      setError(String(err))
      setSelectedPort(null)

      dSerialPortSelectorHook(
        `Received error while trying to fetch ports ${err}`,
      )
    } finally {
      setPorts(ports)
      setIsFetching(false)
    }
  }, [client, setIsFetching, setError, setPorts, currentOperation])

  // Refresh on mount
  useEffect(() => {
    refresh()
  }, [refresh, currentOperation])

  const memoisedOnSuccess = useMemo(() => onSuccess, [])

  // Select callback, connects to a device with a comPath and baudRate
  const select = useCallback(
    async (comPath: string, baudRate: number) => {
      if (!deviceManager) {
        setError('No DeviceManager in tree.')
        return
      }

      if (currentOperation.current) {
        dSerialPortSelectorHook(`Cancelling current operation...`)
        currentOperation.current.cancel()
      }

      const cancellationToken = new CancellationToken()
      currentOperation.current = cancellationToken

      setIsConnecting(true)
      setError('')

      dSerialPortSelectorHook(
        `Selecting port ${comPath} at baudRate ${baudRate}`,
      )

      try {
        const deviceID = await client.selectPort(
          comPath,
          baudRate,
          cancellationToken,
        )

        dSerialPortSelectorHook(
          `Successfully found port at ${comPath} with baudRate ${baudRate}`,
        )

        await deviceManager.connectToDevice(deviceID, cancellationToken)

        dSerialPortSelectorHook(`Successfully connected to ${deviceID}`)

        if (memoisedOnSuccess) memoisedOnSuccess(deviceID)
      } catch (err) {
        if (cancellationToken.caused(err)) {
          return
        }
        // Make the error slightly nicer for display. It tends to nest 'Error: ', so remove those
        setError(`Error: ${String(err).replaceAll('Error: ', '').trim()}`)

        dSerialPortSelectorHook(`Error during selection: ${err}`)
      } finally {
        setIsConnecting(false)
      }
    },
    [
      currentOperation,
      setIsConnecting,
      setError,
      deviceManager,
      setPorts,
      setIsConnecting,
      memoisedOnSuccess,
    ],
  )

  // Cancel callback, cancels the current operation
  const cancel = useCallback(async () => {
    if (currentOperation.current) {
      dSerialPortSelectorHook(`Cancelling current operation`)

      currentOperation.current.cancel()
      currentOperation.current = null
    }
  }, [currentOperation])

  const memoised = useMemo(
    () => ({
      error,
      ports,
      refresh,
      select,
      isFetching,
      isConnecting,
      cancel,
      selectedPort,
      setSelectedPort,
    }),
    [
      error,
      ports,
      refresh,
      select,
      isFetching,
      isConnecting,
      cancel,
      selectedPort,
      setSelectedPort,
    ],
  )

  return memoised
}
