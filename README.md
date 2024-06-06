# smac-electricui-example

This example project showcases integrating the SMAC protocol with Electric UI.

The connection screen:

![connection-screen](./docs/connection-screen.png)

The main screen:

![main-screen](./docs/main-screen.png)

## Installation

1. Follow the [Electric UI installation instructions](https://electricui.com/install). VSCode is the recommended code editor.

2. This repo can be cloned or downloaded in .zip format from the GitHub interface.

![Download screenshot](./docs/download-button.png)

3. Once the repo is downloaded, navigate to it with your operating system's terminal, run `arc install` to install dependencies. A successful installation will look like this:

![successful-installation](./docs/successful-installation.png)

4. The application can be run in development mode with `arc start`.
5. A stand-alone application can be built with `arc build`.


## The SMAC Protocol

The protocol is implemented in `./src/transport-manager/config/smac.ts`.

In short, the protocol consists of a node ID, a **R**ead or **W**rite indicator, an object ID, and a value if writing. A typical exchange may be:

```
> is outgoing from UI to device
< is receiving by UI from device

> 0x00 W 0xB2C00 5 // broadcast a write to object 0xB2C00 with a value of 5
> 0x20 R 0xB2C00   // read the value of object 0xB2C00 at address 0x20
< 0x20 W 0xB2C00 5 // the UI receives the value of 5 from object 0xB2C00 at address 0x20
```

A carriage return character deliminates messages.

#### In Electric UI

- The `objectID` is mapped directly to the `messageID` in Electric UI. The `address` is provided as `Message` metadata and as a tag within the persistence engine.
- By default messages are broadcast on write, and on read the latest message from any node is displayed.
- Specific addresses can be written to and read from by using the `AddressFilter` wrapper component.

## Behaviour

### Connection Page

The connection page allows for manual selection of the serial port and baud rate. The SerialPortSelector component is located at `./src/application/components/SerialPortSelector`.

### Overview Page

There are three cards displayed, each with a different `AddressFilter`. Inside each is an `IntervalRequester`, `ChartContainer`, two Printers, `PollOnce` component, and a `Slider`.

The `AddressFilter` component creates a subtree of components that can only interact with a specific node's address. Specifically, it creates an `IntervalRequester` context, `OutgoingMessageMutator`, `EventConnector` and `DomainWrapper` that isolate all incoming and outgoing messages based on the `address` prop provided.

The `IntervalRequester` will poll specific object IDs at a provided rate in milliseconds.

The `ChartContainer` pulls data from the `useMessageDataSource` hook above, tagging the request with the address from the `AddressFilter` wrapper.

The `PollOnce` component acts as a 'handshake', polling a value once on mount.
