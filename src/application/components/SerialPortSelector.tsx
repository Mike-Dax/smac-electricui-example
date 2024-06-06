import React, { useState } from 'react'
import { SerialPortHintIdentification } from '@electricui/transport-node-serial'
import { useSerialPortSelector } from './useSerialPortSelector'

import { ItemRenderer, Select } from '@blueprintjs/select'
import {
  Button,
  Intent,
  MenuItem,
  FormGroup,
  ControlGroup,
  Icon,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { DeviceID } from '@electricui/core'

const PortSelect = Select.ofType<SerialPortHintIdentification>()
const BaudSelect = Select.ofType<number>()

const baudRates = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]

export function SerialPortSelector(props: {
  onSuccess?: (deviceID: DeviceID) => void
}) {
  const {
    error,
    ports,
    refresh,
    select,
    isFetching,
    isConnecting,
    cancel,
    selectedPort,
    setSelectedPort,
  } = useSerialPortSelector(props.onSuccess)
  const [selectedBaudRate, setSelectedBaudRate] = useState<number>(115200)

  return (
    <>
      <FormGroup
        intent={error === '' ? Intent.NONE : Intent.DANGER}
        helperText={error}
      >
        <ControlGroup fill={true} vertical={false}>
          <ControlGroup fill={true} vertical={false}>
            <PortSelect
              items={ports}
              filterable={false}
              itemRenderer={renderPortOption}
              noResults={<MenuItem disabled={true} text="No ports detected." />}
              activeItem={selectedPort}
              onItemSelect={selected => setSelectedPort(selected)}
              popoverProps={{ minimal: true }}
              fill
            >
              <Button
                text={selectedPort ? selectedPort.path : 'Select COM Path'}
                rightIcon="double-caret-vertical"
                fill
              />
            </PortSelect>

            <Button
              onClick={() => {
                if (isFetching) {
                  cancel()
                } else {
                  refresh()
                }
              }}
              loading={isFetching}
              icon={IconNames.REFRESH}
            />
          </ControlGroup>

          <BaudSelect
            items={baudRates}
            filterable={false}
            itemRenderer={renderBaudRate}
            activeItem={selectedBaudRate}
            onItemSelect={selected => {
              setSelectedBaudRate(selected ?? 115200)
            }}
            popoverProps={{ minimal: true }}
          >
            <Button
              text={selectedBaudRate ? selectedBaudRate : 'Select Baud Rate'}
              rightIcon="double-caret-vertical"
            />
          </BaudSelect>
        </ControlGroup>
      </FormGroup>

      <Button
        onClick={() => {
          return isConnecting
            ? cancel()
            : select(selectedPort?.path ?? '', selectedBaudRate)
        }}
        disabled={!selectedPort || !selectedBaudRate || isFetching}
        intent={Intent.SUCCESS}
        fill
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    </>
  )
}

const renderPortOption: ItemRenderer<SerialPortHintIdentification> = (
  item,
  { handleClick, modifiers },
) => {
  if (!modifiers.matchesPredicate) {
    return null
  }

  return (
    <MenuItem
      active={modifiers.active}
      key={item.path}
      onClick={handleClick}
      text={`${item.path}`}
      label={`${item.manufacturer ? item.manufacturer : ''}`}
    />
  )
}

const renderBaudRate: ItemRenderer<number> = (
  item,
  { handleClick, modifiers },
) => {
  if (!modifiers.matchesPredicate) {
    return null
  }

  return (
    <MenuItem
      active={modifiers.active}
      key={item}
      onClick={handleClick}
      text={item}
    />
  )
}
