import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
} from '@electricui/components-desktop-charts'

import { Card, Colors } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import { IntervalRequester, PollOnce } from '@electricui/components-core'
import { useMessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { Slider } from '@electricui/components-desktop-blueprint'
import { Printer } from '@electricui/components-desktop'
import { AddressFilter } from '../../components/AddressFilter'

const layoutDescription = `
  SectionA SectionB SectionC
`

export const OverviewPage = (props: RouteComponentProps) => {
  const noiseDs = useMessageDataSource('0x6077')

  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.SectionA>
              <Card>
                <p style={{ textAlign: 'center' }}>address 0x01</p>
                <AddressFilter address="0x01">
                  <IntervalRequester
                    messageIDs={['0x6077', '0xA2C00']}
                    interval={100}
                  />

                  <ChartContainer>
                    <LineChart
                      dataSource={noiseDs}
                      color={Colors.RED4}
                      maxItems={50000}
                    />
                    <RealTimeDomain window={[1_000, 5_000, 10_000]} />
                    <TimeAxis />
                    <VerticalAxis />
                  </ChartContainer>

                  <p>
                    0x6077: <Printer accessor="0x6077" />
                  </p>

                  <PollOnce messageID="0xA2C00" />
                  <Slider
                    min={1}
                    max={1000}
                    stepSize={1}
                    labelStepSize={100}
                    sendOnlyOnRelease
                  >
                    <Slider.Handle accessor="0xA2C00" />
                  </Slider>

                  <p>
                    0xA2C00: <Printer accessor="0xA2C00" />
                  </p>
                </AddressFilter>
              </Card>
            </Areas.SectionA>

            <Areas.SectionB>
              <Card>
                <p style={{ textAlign: 'center' }}>address 0x02</p>
                <AddressFilter address="0x02">
                  <IntervalRequester
                    messageIDs={['0x6077', '0xA2C00']}
                    interval={100}
                  />

                  <ChartContainer>
                    <LineChart
                      dataSource={noiseDs}
                      color={Colors.GREEN4}
                      maxItems={50000}
                    />
                    <RealTimeDomain window={[1_000, 5_000, 10_000]} />
                    <TimeAxis />
                    <VerticalAxis />
                  </ChartContainer>

                  <p>
                    0x6077: <Printer accessor="0x6077" />
                  </p>

                  <PollOnce messageID="0xA2C00" />
                  <Slider
                    min={1}
                    max={1000}
                    stepSize={1}
                    labelStepSize={100}
                    sendOnlyOnRelease
                  >
                    <Slider.Handle accessor="0xA2C00" />
                  </Slider>

                  <p>
                    0xA2C00: <Printer accessor="0xA2C00" />
                  </p>
                </AddressFilter>
              </Card>
            </Areas.SectionB>

            <Areas.SectionC>
              <Card>
                <p style={{ textAlign: 'center' }}>address 0x20</p>
                <AddressFilter address="0x20">
                  <IntervalRequester
                    messageIDs={['0x6077', '0xA2C00']}
                    interval={100}
                  />

                  <ChartContainer>
                    <LineChart
                      dataSource={noiseDs}
                      color={Colors.BLUE4}
                      maxItems={50000}
                    />
                    <RealTimeDomain window={[1_000, 5_000, 10_000]} />
                    <TimeAxis />
                    <VerticalAxis />
                  </ChartContainer>

                  <p>
                    0x6077: <Printer accessor="0x6077" />
                  </p>

                  <PollOnce messageID="0xA2C00" />
                  <Slider
                    min={1}
                    max={1000}
                    stepSize={1}
                    labelStepSize={100}
                    sendOnlyOnRelease
                  >
                    <Slider.Handle accessor="0xA2C00" />
                  </Slider>

                  <p>
                    0xA2C00: <Printer accessor="0xA2C00" />
                  </p>
                </AddressFilter>
              </Card>
            </Areas.SectionC>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
