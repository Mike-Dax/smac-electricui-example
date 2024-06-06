import React, { ReactNode, useState } from 'react'

import {
  OutgoingMessageMutator,
  EventConnector,
  IntervalRequesterContextProvider,
} from '@electricui/components-core'
import { DomainWrapper } from '@electricui/charts'
import { Message } from '@electricui/core'
import { SMACMessageMetadata } from '../../transport-manager/config/smac'

/**
 * Filters the React tree by a SMAC address.
 */
export function AddressFilter(props: { address: string; children: ReactNode }) {
  return (
    // Create a new interval requester state management instance so we don't deduplicate
    // requests based on the messageID (and not the address).
    <IntervalRequesterContextProvider key={props.address}>
      {/* Mutate all outgoing messages with the address. */}
      <OutgoingMessageMutator
        mutator={(message: Message<number, SMACMessageMetadata>) => {
          // Outgoing data must match the address
          message.metadata.address = props.address

          return message
        }}
      >
        <EventConnector
          filter={(deviceID, message: Message<number, SMACMessageMetadata>) => {
            // Incoming message metadata must match the address
            return message.metadata.address === props.address
          }}
        >
          <DomainWrapper
            queryMutator={query =>
              query.tags({
                // Tag chart queries with a match of the specific address
                address: [props.address],
              })
            }
          >
            {props.children}
          </DomainWrapper>
        </EventConnector>
      </OutgoingMessageMutator>
    </IntervalRequesterContextProvider>
  )
}
