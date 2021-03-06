/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionedDetailPropertyView',
  extends: 'foam.u2.View',

  documentation: `
    View for one property of a SectionedDetailView.
  `,

  requires: [
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Col'
  ],

  properties: [
    'prop',
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      this
        .addClass(this.myClass())
        .add(this.slot(function(prop) {
          var errorSlot = self.slot(function(data, prop$validateObj){
            return data && prop$validateObj && data.slot(prop$validateObj);
          });
          return self.E()
            .start(self.Rows)
              .add(prop.label$)
              .start(self.Cols, { contentJustification: foam.u2.layout.ContentJustification.START })
                .add(prop)
                .callIf(prop.help, function() { 
                  this.start({class: 'foam.u2.tag.Image', data: 'images/question-icon.svg'})
                    .attrs({ title: prop.help })
                  .end();
                })
              .end()
              .add(errorSlot.map((s) => {
                return self.E().add(s);
              }));
        }));
    }
  ]
});
