function setHighlightStyle(dropArea) {
  var style = document.createElement('style')

  style.type = 'text/css'
  style.innerHTML = `.highlight_me {
    background: orange;
    cursor: pointer;
  }`

  dropArea.appendChild(style)
}

export default class BoardImporter {
  static import(file, importer) {
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = () => {
      try {
        let model = JSON.parse(reader.result)
        importer(file.name.replace(/\.[^/.]+$/, ''), model)
      } catch (e) {
        console.error('board import failed', e)
      }
    }
  }

  static preview(file) {
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = () => {
      try {
        let previewModel = JSON.parse(reader.result)

        var preview = document.createElement('board-viewer')

        preview.style.width = '100%'
        preview.style.height = '80%'
        preview.style.margin = '0'
        preview.style.padding = '0'
        preview.model = previewModel
        // preview.provider = provider;

        var buttons = document.createElement('div')

        buttons.style.classList = 'buttons'
        buttons.innerHTML = `
          <paper-button dialog-dismiss>Cancel</paper-button>
          <paper-button dialog-confirm autofocus>Accept</paper-button>
        `

        var dialog = document.createElement('paper-dialog')

        dialog.style.width = '100%'
        dialog.style.height = '100%'
        dialog.setAttribute('with-backdrop', true)
        dialog.setAttribute('auto-fit-on-attach', true)
        dialog.setAttribute('always-on-top', true)
        dialog.addEventListener('iron-overlay-closed', () => {
          dialog.parentNode.removeChild(dialog)
        })

        dialog.appendChild(preview)
        dialog.appendChild(buttons)
        document.body.appendChild(dialog)

        requestAnimationFrame(() => {
          dialog.open()
        })
      } catch (e) {
        console.error('board preview failed', e)
      }
    }
    // let url = 'YOUR URL HERE'
    // let formData = new FormData()

    // formData.append('file', file)

    // fetch(url, {
    //   method: 'POST',
    //   body: formData
    // })
    //   .then(() => { /* Done. Inform the user */ })
    //   .catch(() => { /* Error. Inform the user */ })
  }

  static set(dropArea, judge, importer) {
    setHighlightStyle(dropArea)

    var preventDefaults = e => {
      if (!judge || judge()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    var highlight = e => {
      if (!judge || judge()) {
        dropArea.classList.add('highlight_me')
      }
    }

    var unhighlight = e => {
      if (!judge || judge()) {
        dropArea.classList.remove('highlight_me')
      }
    }

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      dropArea.addEventListener(event, preventDefaults, false)
    })
    ;['dragenter', 'dragover'].forEach(event => {
      dropArea.addEventListener(event, highlight, false)
    })
    ;['dragleave', 'drop'].forEach(event => {
      dropArea.addEventListener(event, unhighlight, false)
    })

    dropArea.addEventListener(
      'drop',
      e => {
        if (!judge || judge()) {
          let dt = e.dataTransfer
          let files = dt.files

          // [...files].forEach((file) => BoardImporter.preview(file))
          ;[...files].forEach(file => BoardImporter.import(file, importer))
        }
      },
      false
    )
  }
}
