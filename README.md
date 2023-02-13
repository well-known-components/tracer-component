# Tracer component

This component creates trace spans over an execution, providing context to the code being executed so it can be traced.

## Usage

The tracer component is pretty straightforward to use, just import the component, initialize it and wrap your traceable code into a trace span:

```ts
import { createTracerComponent } from '@well-known-components/tracer-component'

const tracer = createTracerComponent()
tracer.span('my span', () => {
  // Do some work here
})
```

While being into the span, the traced code is able to access the trace context, this is specially useful if we want to add traced logs to our code:

```ts
const tracer = createTracerComponent()
tracer.span('my span', () => {
  console.log(`[${tracer.getTraceString()}] Starting some work`)
  // Do some work here
  console.log(`[${tracer.getTraceString()}] Finishing some work`)
})
```

In the example given above, the logs will output a trace alongside the log message using the [traceparent format](https://www.w3.org/TR/trace-context/#traceparent-header).

```bash
  [00-7970d1a8361cc811ee59dc3ee1c8134e-0000000000000000-00] Starting some work
  [00-7970d1a8361cc811ee59dc3ee1c8134e-0000000000000000-00] Finishing some work
```

As seen in the example, the format is built as: `version-traceId-parentId-flags`. The trace id makes it easy to track which execution of the span we're logging and will be unique through the span execution. The parent id identifies the span id where the current span was created from, making it possible to track which span originated the current span. All of this values, including version and flags values can be seen in the [traceparent format](https://www.w3.org/TR/trace-context/) document.
