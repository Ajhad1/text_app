import client from './lib/client'
import events from './events'
import i18n from './lib/i18n'

const app = {
  renderText: function (settings) {
    app.convertPlaceholders(settings.textBody)
      .then(function (textBody) {
        textBody = app.convertHTML(textBody)
        textBody = app.convertLinks(textBody)
        textBody = app.convertLinebreaks(textBody)
        return textBody
      })
      .then(function (textBody) {
        const el = document.querySelector('[data-main]')
        el.innerHTML = textBody
        app.resize()
      })
  },

  convertHTML: function (string) {
    return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  },

  convertLinks: function (string) {
    // Thanks to github:bryanwoods for the pattern
    // Lint complains about this regex, this should always be excluded otherwise the app breaks or URLs don't work
    const urlPattern = /(^|\s)(\b(https?):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|]\b)/ig // eslint-disable-line
    return string.replace(urlPattern, "$1<a href='$2' target='_blank'>$2</a>")
  },

  convertLinebreaks: function (string) {
    return string.replace(/\n\r?/g, '<br />')
  },

  convertPlaceholders: function (string) {
    const regexPlaceholder = new RegExp('({{)(.*?)(}})', 'g')
    const regexSymbol = new RegExp('({{|}})', 'g')
    let strMatches = string.match(regexPlaceholder)
    if (!strMatches) return Promise.resolve(string)

    return app.getData().then(function (data) {
      strMatches.forEach(function (curMatch) {
        let curMatchStripped = curMatch.replace(regexSymbol, '')
        let curMatchReplaced = curMatch.replace(regexPlaceholder, app.matchPlaceholder(curMatchStripped, data))
        string = string.replace(curMatch, curMatchReplaced)
      })

      return string
    })
  },

  matchPlaceholder: function (placeholderStripped, data) {
    let string = ''
    try {
      switch (placeholderStripped) {
        case 'ticket.id':
          string = data.ticket.id
          break

        case 'ticket.subject':
          string = data.ticket.subject
          break

        case 'ticket.description':
          string = data.ticket.description
          break

        case 'ticket.status':
          string = data.ticket.status && i18n.t(data.ticket.status)
          break

        case 'ticket.priority':
          string = data.ticket.priority && i18n.t(data.ticket.priority)
          break

        case 'ticket.type':
          string = data.ticket.type && i18n.t(data.ticket.type)
          break

        case 'ticket.requester.id':
          string = data.ticket.requester && data.ticket.requester.id
          break

        case 'ticket.requester.name':
          string = data.ticket.requester && data.ticket.requester.name
          break

        case 'ticket.requester.email':
          string = data.ticket.requester && data.ticket.requester.email
          break

        case 'ticket.assignee.id':
          string = (data.assignee.user && data.assignee.user.id) || (data.assignee.group && data.assignee.group.id)
          break

        case 'ticket.assignee.name':
          string = (data.assignee.user && data.assignee.user.name) || (data.assignee.group && data.assignee.group.name)
          break

        case 'ticket.assignee.email':
          string = data.assignee.user && data.assignee.user.email
          break

        case 'ticket.tags':
          string = data.ticket.tags.join(', ')
          break

        case 'current_user.id':
          string = data.currentUser.id
          break

        case 'current_user.name':
          string = data.currentUser.name
          break

        case 'current_user.email':
          string = data.currentUser.email
          break

        default:
          string = placeholderStripped
      }
      return string || ''
    } catch (e) {
      console.error(placeholderStripped + ' cannot be interpolated')
    }
  },

  getData: function () {
    return client.get(['ticket', 'currentUser']).then(function (data) {
      return {
        ticket: data.ticket,
        assignee: data.ticket.assignee,
        currentUser: data.currentUser
      }
    })
  },

  resize: function () {
    setTimeout(function () {
      const body = document.querySelector('body')
      client.invoke('resize', { width: '100%', height: body.scrollHeight })
    }, 5)
  }
}

const onReady = new Promise((resolve) => {
  client.on('app.registered', function (context, metadata) {
    resolve(context.metadata.settings)
  })
})

Promise.all([
  onReady,
  client.get('currentUser.locale')
]).then((data) => {
  const settings = data[0]
  const locale = data[1]['currentUser.locale']

  i18n.loadTranslations(locale)

  if (settings) {
    app.renderText(settings)

    events.forEach(function (evt) {
      client.on(evt, () => app.renderText(settings))
    })
  }
})

export default app
