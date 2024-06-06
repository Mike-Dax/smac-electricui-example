import { Card } from '@blueprintjs/core'
import { RouteComponentProps } from '@reach/router'

import { Logo } from '../components/Logo'
import { navigate } from '@electricui/utility-electron'
import { SerialPortSelector } from '../components/SerialPortSelector'
import React from 'react'

export const ConnectionPage = (props: RouteComponentProps) => {
  return (
    <React.Fragment>
      <div style={{ height: '100vh' }}>
        <Logo />

        <Card
          style={{
            maxWidth: 480,
            margin: '10vh auto',
          }}
        >
          <SerialPortSelector
            onSuccess={deviceID => navigate(`/devices/${deviceID}`)}
          />
        </Card>
      </div>
    </React.Fragment>
  )
}
