/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardForm',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.demos.net.nap.web.model.Messageboard',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'blobService',
    'onInvoiceFileRemoved',
    'messageboard',
    'messageboardDAO',
    'stack',
    'user'
  ],

  exports: [
    'as data',
  ],

  documentation: 'New Messageboard Form',

  properties: [
    {
      class: 'Long',
      name: 'id_'
    },
    {
      class: 'Boolean',
      name: 'starmark_',
      view: { class: 'foam.u2.CheckBox' }
    },
    {
      class: 'String',
      name: 'title_'
    },
    {
      class: 'String',
      name: 'description_',
      view: { class: 'foam.u2.tag.TextArea', rows: 30, cols: 120}
    },
    {
      class: 'DateTime',
      name: 'createdDate_',
      visibility: foam.u2.Visibility.RO,
      factory: function(){
        return new Date();
      }
    },
    {
      class: 'String',
      name: 'creator_'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'messageboardFile_',
      value: this.exportData
    },
    'exportData',
    {
      class: 'Boolean',
      name: 'dragActive',
      value: false
    },
    [ 'uploadHidden', false ],
    [ 'removeHidden', false ]
  ],

  messages: [
    { name: 'UploadDesc', message: 'Or drag and drop an image here' },
    { name: 'UploadRestrict', message: '* jpg, jpeg, or png only, 2MB maximum, 100*100 72dpi recommanded' },
    { name: 'FileError', message: 'File required' },
    { name: 'FileTypeError', message: 'Wrong file format' },
    { name: 'ErrorMessage', message: 'Please upload an image less than 2MB' }
  ],

  css: `
    ^{
      width: 100%;
      margin: auto;
      background-color: #edf0f5;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-right: 10px;
      margin-bottom: 10px;
    }
    ^ .actions {
      width: 1240px;
      height: 40px;
      margin: 0 auto;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .net-nanopay-ui-ActionView-saveAction {
      float: right;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      margin-bottom: 10px;
      width: 140px;
      height: 40px;
      background-color: #59a5d5;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }
    ^ .net-nanopay-ui-ActionView-backAction:hover {
      background: lightgray;
    }
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .attachment-btn {
      margin-left: 5px;
      margin-bottom: 10px;
      margin-top: 10px;
    }
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .box-for-drag-drop {
      margin: 20px;
      border: dashed 4px #edf0f5;
      height: 100px;
      width: 560px;
      overflow: scroll;
    }
    ^ .boxless-for-drag-drop {
      border: dashed 4px #a4b3b8;
      width: 97%;
      height: 110px;
      padding: 10px 10px;
      position: relative;
      margin-bottom: 10px;
      margin-left: 5px;
      overflow: scroll;
    }
    ^ .tableView {
      ackground: #fafafa;
      border: 1px solid grey;
    }
    ^ .foam-u2-PropertyView-label {
      color: #444;
      display: block;
      float: left;
      font-size: 13px;
      padding: 4px 8px 4px 8px;
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
    }
    ^ .foam-u2-PropertyView {
      padding: 2px 8px 2px 6px;
    }
    ^ .uploadButtonContainer {
      height: 80px;
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 40px;
    }
    ^ .removeButtonContainer {
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 20px;
      vertical-align: top;
      margin-top: 5px;
    }
    ^ .attachment-number {
      float: left;
      width: 21px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-right: 10px;
    }
    ^ .attachment-filename {
      max-width: 342px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      float: left;
    }
    ^ .attachment-view {
      min-width: 700px;
      max-width: 275px;
      height: 40px;
      background-color: #ffffff;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 5px;
    }
    ^ .attachment-footer {
      float: right;
    }
    ^ .attachment-filesize {
      width: 16.7px;
      height: 8px;
      font-size: 6px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      text-align: left;
      color: #a4b3b8;
      padding-top: 6px;
    }

  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var userId = this.user.id;
      var userName = this.user.firstName;
      // var messageboardObj = this.data;
      // this.messageboardFile = Array.from(messageboardObj.messageboardFile);

      this.addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
            //.start(this.SAVE_ACTION).end()
            .start().add('SAVE').addClass('net-nanopay-ui-ActionView-saveAction').on('click', this.save).end()
          .end()

          .start('table').addClass('tableView')
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Id').end()
              .start('td').addClass('foam-u2-PropertyView').add(this.ID_).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Starmark').end()
              .start('td').addClass('foam-u2-PropertyView').tag(this.STARMARK_).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Title').end()
              .start('td').addClass('foam-u2-PropertyView').add(this.TITLE_).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Date').end()
              .start('td').addClass('foam-u2-PropertyView').add(this.CREATED_DATE_).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Creator').end()
              .start('td').addClass('foam-u2-PropertyView').add(this.user.firstName).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Content').end()
              .start('td').addClass('foam-u2-PropertyView').add(this.DESCRIPTION_).end()
            .end()
            .start('tr')
              .start('td').addClass('foam-u2-PropertyView-label').add('Attachments').end()
              .start('td')

              .start().addClass('attachment-btn white-blue-button btn')
                .add('Choose File')
                .on('click', this.onAddAttachmentClicked)
              .end()
              .start('div').addClass('boxless-for-drag-drop')
              // .start('div').addClass(this.dragActive$.map(function (drag) {
              //   return drag ? 'box-for-drag-drop':'boxless-for-drag-drop';
              // }))
                .add(this.slot(function (data) {
                  var e = this.E();
                  for ( var i = 0 ; i < data.length ; i++ ) {
                    //var fileData = messageboardObj.messageboardFile;
                      e.start('div').addClass('attachment-view').setID(i+1)
                      // .start().addClass('attachment-number')
                      //   .add(this.formatFileNumber(i+1))
                      // .end()
                      .start().addClass('attachment-filename')
                        .start('a')
                          .attrs({
                            href: this.messageboardFile_$.map(function (data) {
                              if ( data[i] ) {
                                  var blob = data[i].data;
                                  var sessionId = localStorage['defaultSession'];

                                  if ( self.BlobBlob.isInstance(blob) ) {
                                    return URL.createObjectURL(blob.blob);
                                  } else {
                                    var url = '/service/httpFileService/' + data[i].id;

                                    // attach session id if available
                                    if ( sessionId ) {
                                      url += '?sessionId=' + sessionId;
                                    }
                                    return url;
                                  }
                              }
                              // else {
                              //   alert('2');
                              //   start().add(messageboardObj.messageboardFile[i].filename).end()
                              // }
                           }),
                           target: '_blank'
                         })  //attrs
                         .add(this.slot(function (filename) {
                           var len = filename.length;
                           return ( len > 35 ) ? (filename.substr(0, 20) +
                             '...' + filename.substr(len - 10, len)) : filename;
                         }, this.messageboardFile_[i].filename$))   //this.messageboardFile[i].filename$ messageboardObj
                      .end()
                   .end()
                   .start().addClass('attachment-footer').setID(i+1)
                     //.start().add(this.REMOVE).hide(this.removeHidden).end()
                     .start({ class: 'foam.u2.tag.Image', data: 'images/ic-delete.svg'}).hide(this.removeHidden).end()
                     .on('click', function(e) {
                       console.log(this);
                       self.messageboardFile_.splice(this.id - 1, 1);
                       this.remove();
                       self.messageboardFile_ = Array.from(self.messageboardFile_);
                     })

                     // .start().addClass('attachment-filesize')
                     //   .add(this.formatFileSize())
                     // .end()
                   .end()
                   .end()
                  }
                  return e;
                }, this.messageboardFile_$))
                .on('dragstart', this.onDragStart)
                .on('dragenter', this.onDragEnter)
                .on('dragover', this.onDragOver)
                .on('drop', this.onDrop)
                .start().addClass('uploadButtonContainer').hide(this.uploadHidden)
                  .start('input').addClass('attachment-input')
                    .attrs({
                      type: 'file',
                      accept: 'image/jpg,image/gif,image/jpeg,image/bmp,image/png,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    })
                    .on('change', this.onChange)
                  .end()
                .end()
            .end()
            .end()

          .end()
          .end();
  },
    function formatFileNumber(i) {
      return ('000' + i).slice(-3);
    },

    // function formatFileSize() {
    //   return Math.ceil(this.data.filesize / 1024) + 'K';
    // }
  ],

  actions: [
    // {
    //   name: 'saveAction',
    //   label: 'Save',
    //   code: function(X) {
    //     var self = this;
    //
    //     if ( self.title == null || self.title == '' ) {
    //       this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Title.', type: 'error' }));
    //       return;
    //     }
    //
    //     if ( self.content == null || self.content == '' ) {
    //       this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Content.', type: 'error' }));
    //       return;
    //     }
    //
    //     var message = this.Messageboard.create({
    //       id : self.id,
    //       starmark : self.starmark,
    //       title: self.title,
    //       content: self.content,
    //       creator : self.creator,
    //       createdDate : self.createdDate,
    //       messageboardFile : Array.from(self.messageboardFile)
    //     });
    //
    //     self.messageboardDAO.put(message).then(function() {
    //       self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' }, this);
    //     })
    //   }
    // },

    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        var self = this;
        X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
      }
    }
  ],

  listeners: [
    function onAddAttachmentClicked () {
      this.document.querySelector('.attachment-input').click();
    },

    function onRemoveClicked (e) {
      this.dragActive = false;
      this.data = null;
    },

    function onChange (e) {
      this.dragActive = false;
      var files = e.target.files;
      this.addFiles(files)
    },

    function onDragOver(e) {
      this.dragActive = true;
      e.preventDefault();
    },

    function onDrop(e) {
      e.preventDefault();
      var files = [];
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items
        if ( inputFile ) {
          for ( var i = 0; i < inputFile.length; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if( this.isFileType(file) ) files.push(file);
              else
                this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
            }
          }
        }
      } else if( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files
        for (var i = 0; i < inputFile.length; i++) {
          var file = inputFile[i];
          if( this.isFileType(file) ) files.push(file);
          else{
            this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
          }
        }
      }
      this.addFiles(files)
    },

    function isFileType(file) {
      if ( file.type === "image/jpg"  ||
           file.type === "image/jpeg" ||
           file.type === "image/gif"  ||
           file.type === "image/bmp"  ||
           file.type === "image/png"  ||
           file.type === "application/msword" ||
           file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
           file.type === "application/vnd.ms-powerpoint" ||
           file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
           file.type === "application/vnd.openxmlformats-officedocument.presentationml.slideshow" ||
           file.type === "application/vnd.oasis.opendocument.text" ||
           file.type === "application/vnd.ms-excel" ||
           file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
           file.type === "application/pdf"
        )
        return true;
      return false;
    },

    function addFiles(files) {
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
          continue;
        }
        var isIncluded = false
        for ( var j = 0 ; j < this.messageboardFile.length ; j++ ) {
          if( this.messageboardFile[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break
          }
        }
        if ( isIncluded ) continue ;
        this.messageboardFile_.push(this.File.create({
          filename: files[i].name,
          filesize: files[i].size,
          mimeType: files[i].type,
          data: this.BlobBlob.create({
            blob: files[i]
          })
        }))
      }
      this.messageboardFile_ = Array.from(this.messageboardFile_);
      this.exportData = this.data;
    },

    function save() {
      var self = this;

      if ( self.title_ == null || self.title_ == '' ) {
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Title.', type: 'error' }));
        return;
      }

      if ( self.description_ == null || self.description_ == '' ) {
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Content.', type: 'error' }));
        return;
      }

      var message = self.Messageboard.create({
        id : self.id_,
        starmark : self.starmark_,
        title: self.title_,
        content: self.description_,
        creator : this.user.firstName_,
        createdDate : self.createdDate_,
        messageboardFile : Array.from(self.messageboardFile_)
      });

      self.messageboardDAO.put(message).then(function() {
        self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
      });


    }
  ]

});
