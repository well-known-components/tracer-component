import { buildTraceString, createTracerComponent, generateSpanId, generateTraceId, ITracerComponent, TraceContext } from '../src'
import { NotInSpanError } from '../src/errors'

let tracerComponent: ITracerComponent
let defaultContext: Omit<TraceContext, 'id' | 'data' | 'name'> & { data?: any }

beforeEach(() => {
  tracerComponent = createTracerComponent()
  defaultContext = {
    version: '00',
    traceId: generateTraceId(),
    parentId: generateSpanId(),
    traceFlags: '00'
  }
})

describe('when executing a span', () => {
  it('should return the same result as the given function', () => {
    expect(tracerComponent.span('test span', () => 1)).toBe(1)
  })
})

describe('when getting if an execution is inside of a trace span', () => {
  describe('and it is inside of a trace span', () => {
    it('should return true', () => {
      return tracerComponent.span('test span', () => expect(tracerComponent.isInsideOfTraceSpan()).toBe(true), defaultContext)
    })
  })

  describe('and it is not inside of a trace span', () => {
    it('should return false', () => {
      expect(tracerComponent.isInsideOfTraceSpan()).toBe(false)
    })
  })
})

describe('when getting the trace object', () => {
  describe('when inside of a span', () => {
    it('should return the trace object', () => {
      return tracerComponent.span(
        'test span',
        () =>
          expect(tracerComponent.getTrace()).toEqual({
            version: defaultContext.version,
            traceId: defaultContext.traceId,
            parentId: defaultContext.parentId,
            traceFlags: defaultContext.traceFlags
          }),
        defaultContext
      )
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTrace()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the trace string', () => {
  describe('when inside of a span', () => {
    it('should return a string representing the tracestate header of the current trace', () => {
      return tracerComponent.span(
        'test span',
        () => expect(tracerComponent.getTraceString()).toBe(buildTraceString(defaultContext)),
        defaultContext
      )
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTraceString()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the trace child', () => {
  describe('when inside of a span', () => {
    it('should return the trace child object where the parent id is the current span id', () => {
      return tracerComponent.span(
        'test span',
        () =>
          expect(tracerComponent.getTraceChild()).toEqual({
            version: defaultContext.version,
            traceId: defaultContext.traceId,
            parentId: tracerComponent.getSpanId(),
            traceFlags: defaultContext.traceFlags
          }),
        defaultContext
      )
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTraceChild()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the trace child string', () => {
  describe('when inside of a span', () => {
    it('should return a string representing the tracestate header where the parent id is the current span id', () => {
      return tracerComponent.span(
        'test span',
        () =>
          expect(tracerComponent.getTraceChildString()).toBe(
            buildTraceString({
              version: defaultContext.version,
              traceId: defaultContext.traceId,
              parentId: tracerComponent.getSpanId(),
              traceFlags: defaultContext.traceFlags
            })
          ),
        defaultContext
      )
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTraceChildString()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the trace state', () => {
  describe('when inside of a span', () => {
    describe("and there's no trace state", () => {
      it('should return null', () => {
        return tracerComponent.span('test span', () => expect(tracerComponent.getTraceState()).toBeNull(), defaultContext)
      })
    })

    describe("and there's trace state", () => {
      beforeEach(() => {
        defaultContext.traceState = {
          aStateKey: 'aStateValue'
        }
      })

      it('should return the trace state', () => {
        return tracerComponent.span(
          'test span',
          () => expect(tracerComponent.getTraceState()).toEqual({ aStateKey: 'aStateValue' }),
          defaultContext
        )
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTraceState()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the trace state string', () => {
  describe('when inside of a span', () => {
    describe("and there's no trace state", () => {
      it('should return null', () => {
        return tracerComponent.span('test span', () => expect(tracerComponent.getTraceState()).toBeNull(), defaultContext)
      })
    })

    describe("and there's trace state", () => {
      beforeEach(() => {
        defaultContext.traceState = {
          aStateKey: 'aStateValue'
        }
      })

      it('should return the trace state', () => {
        return tracerComponent.span(
          'test span',
          () =>
            expect(tracerComponent.getTraceState()).toEqual({
              aStateKey: 'aStateValue'
            }),
          defaultContext
        )
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getTraceState()).toThrowError(NotInSpanError)
    })
  })
})

describe('when getting the span trace context data', () => {
  describe('when inside of a span', () => {
    describe("and there's no trace context data", () => {
      it('should return null', () => {
        return tracerComponent.span('test span', () => expect(tracerComponent.getContextData()).toBeNull(), defaultContext)
      })
    })

    describe("and there's context data", () => {
      beforeEach(() => {
        defaultContext.data = { aKey: 'aValue' }
      })

      it('should return the context data', () => {
        return tracerComponent.span(
          'test span',
          () => {
            return expect(tracerComponent.getContextData()).toEqual({ aKey: 'aValue' })
          },
          defaultContext
        )
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.getContextData()).toThrowError(NotInSpanError)
    })
  })
})

describe('when setting the trace span context data', () => {
  describe('when inside of a span', () => {
    it('should set the trace span context data with the provided key and value', () => {
      return tracerComponent.span('test span', () => {
        tracerComponent.setContextData({
          aKey: 'aValue',
          anotherKey: 'anotherValue'
        })

        expect(tracerComponent.getContextData()).toEqual({
          aKey: 'aValue',
          anotherKey: 'anotherValue'
        })
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.setContextData({ aKey: 'aValue' })).toThrowError(NotInSpanError)
    })
  })
})

describe('when setting the trace state data', () => {
  describe('when inside of a span', () => {
    describe("when there's no trace state", () => {
      it('should create the trace state with the new key and value', () => {
        return tracerComponent.span(
          'test span',
          () => {
            tracerComponent.setTraceStateProperty('aKey', 'aValue')
            return expect(tracerComponent.getTraceState()).toEqual({ aKey: 'aValue' })
          },
          defaultContext
        )
      })
    })

    describe("and there's a trace state without the new key", () => {
      beforeEach(() => {
        defaultContext.traceState = { anotherKey: 'anotherValue' }
      })

      it('should add the new key and value to the trace state', () => {
        return tracerComponent.span(
          'test span',
          () => {
            tracerComponent.setTraceStateProperty('aKey', 'aValue')
            return expect(tracerComponent.getTraceState()).toEqual({ aKey: 'aValue', anotherKey: 'anotherValue' })
          },
          defaultContext
        )
      })
    })

    describe("and there's a trace state with the given key", () => {
      beforeEach(() => {
        defaultContext.traceState = { aKey: 'aValue' }
      })

      it('should overwrite the key and value of the trace state', () => {
        return tracerComponent.span(
          'test span',
          () => {
            tracerComponent.setTraceStateProperty('aKey', 'anotherValue')
            return expect(tracerComponent.getTraceState()).toEqual({ aKey: 'anotherValue' })
          },
          defaultContext
        )
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.setTraceStateProperty('aKey', 'aValue')).toThrowError(NotInSpanError)
    })
  })
})

describe('when deleting the trace state data', () => {
  describe('when inside of a span', () => {
    describe("when there's no trace state", () => {
      it('should do nothing and return', () => {
        return tracerComponent.span(
          'test span',
          () => expect(() => tracerComponent.deleteTraceStateProperty('aKey')).not.toThrow(),
          defaultContext
        )
      })
    })

    describe("when there's a trace state without the key to be deleted", () => {
      beforeEach(() => {
        defaultContext.traceState = {
          anotherKey: 'aValue'
        }
      })

      it('should do nothing and return', () => {
        return tracerComponent.span(
          'test span',
          () => {
            tracerComponent.deleteTraceStateProperty('aKey')
            return expect(tracerComponent.getTraceState()).toEqual(defaultContext.traceState)
          },
          defaultContext
        )
      })
    })

    describe("when there's a trace state with the key to be deleted", () => {
      beforeEach(() => {
        defaultContext.traceState = {
          aKey: 'aValue',
          anotherKey: 'anotherValue'
        }
      })

      it('should delete the property with the given key', () => {
        return tracerComponent.span(
          'test span',
          () => {
            tracerComponent.deleteTraceStateProperty('aKey')
            return expect(tracerComponent.getTraceState()).toEqual({ anotherKey: 'anotherValue' })
          },
          defaultContext
        )
      })
    })
  })

  describe('when outside of a span', () => {
    it('should throw a not in span error', () => {
      expect(() => tracerComponent.deleteTraceStateProperty('aKey')).toThrowError(NotInSpanError)
    })
  })
})
