/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'Candlestick',
  ids: ['closeTime', 'key'],
  tableColumns: [
    'key',
    'openTime',
    'closeTime',

    'open',
    'openValueTime',

    'close',
    'closeValueTime',

    'min',
    'max',
    'average'
  ],
  properties: [
    {
      class: 'Object',
      name: 'key'
    },
    {
      class: 'Float',
      name: 'min'
    },
    {
      class: 'Float',
      name: 'max'
    },
    {
      class: 'DateTime',
      name: 'openTime'
    },
    {
      class: 'Float',
      name: 'open'
    },
    {
      class: 'DateTime',
      name: 'openValueTime'
    },
    {
      class: 'DateTime',
      name: 'closeTime'
    },
    {
      class: 'Float',
      name: 'close'
    },
    {
      class: 'DateTime',
      name: 'closeValueTime'
    },
    {
      class: 'Float',
      name: 'total'
    },
    {
      class: 'Float',
      name: 'count'
    },
    {
      class: 'Float',
      name: 'average',
      transient: true,
      javaGetter: 'return getCount() > 0 ? getTotal() / getCount() : 0;',
      expression: function(total, count) {
        return count ? total / count : 0;
      }
    }
  ],
  methods: [
    {
      name: 'add',
      args: [
        {
          type: 'Float',
          name: 'v'
        },
        {
          type: 'Date',
          name: 'time'
        }
      ],
      javaCode: `
setMin(isPropertySet("min") ? Math.min(v, getMin()) : v);
setMax(isPropertySet("max") ? Math.max(v, getMax()) : v);
if ( ! isPropertySet("openValueTime") || time.compareTo(getOpenValueTime()) < 0 ) {
  setOpenValueTime(time);
  setOpen(v);
}
if ( ! isPropertySet("closeValueTime") || time.compareTo(getCloseValueTime()) > 0 ) {
  setCloseValueTime(time);
  setClose(v);
}
setTotal(getTotal() + v);
setCount(getCount() + 1);
      `
    },
    {
      name: 'reduce',
      args: [
        {
          type: 'foam.nanos.analytics.Candlestick',
          name: 'c'
        }
      ],
      javaCode: `
setOpenValueTime(getOpenValueTime().compareTo(c.getOpenValueTime()) < 0 ? getOpenValueTime() : c.getOpenValueTime());
setOpen(getOpenValueTime().compareTo(c.getOpenValueTime()) < 0 ? getOpen() : c.getOpen());

setCloseValueTime(getCloseValueTime().compareTo(c.getCloseValueTime()) < 0 ? getCloseValueTime() : c.getCloseValueTime());
setClose(getCloseValueTime().compareTo(c.getCloseValueTime()) < 0 ? getClose() : c.getClose());

setMin(Math.min(getMin(), c.getMin()));
setMax(Math.max(getMax(), c.getMax()));

setTotal(getTotal() + c.getTotal());
setCount(getCount() + c.getCount());
      `
    }
  ]
});