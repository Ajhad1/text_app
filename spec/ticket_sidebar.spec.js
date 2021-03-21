/* eslint-env jest */
import app from '../src/javascript/ticket_sidebar'
import client from '../src/javascript/lib/client'

client.get = jest.fn().mockResolvedValue(
  {
    currentUser: {
      name: 'enrique iglesias'
    },
    ticket: {
      id: 1,
      assignee: 'maria sharapova'
    }
  }
)

describe('App', () => {
  describe('#convertPlaceholders', () => {
    it('returns original string WITHOUT Regex Placeholder', async (done) => {
      const strWithoutPlaceholder = 'The Ticket ID is ticket.id'
      const convertedStrWithoutPlaceholder = await app.convertPlaceholders(strWithoutPlaceholder)
      expect(convertedStrWithoutPlaceholder).toBe(strWithoutPlaceholder)
      done()
    })

    it('converts string with Regex Placeholder WITH returned data', async (done) => {
      const stringWithTicketIDPlaceholder = 'The Ticket ID is {{ticket.id}}'
      const convertedStringWithTicketID = await app.convertPlaceholders(stringWithTicketIDPlaceholder)
      expect(convertedStringWithTicketID).toBe('The Ticket ID is 1')

      const stringWithCurrentUserPlaceholder = 'The current user is {{current_user.name}}'
      const convertedStringWithCurrentUser = await app.convertPlaceholders(stringWithCurrentUserPlaceholder)
      expect(convertedStringWithCurrentUser).toBe('The current user is enrique iglesias')

      done()
    })
  })

  describe('#convertHTML', () => {
    it('replaces < and >, with &lt; and &gt;', () => {
      expect(app.convertHTML('< htmlTag >')).toBe('&lt; htmlTag &gt;')
    })
  })

  describe('#convertLinks', () => {
    const urlString = 'https://www.zendesk.com'

    it('returns url link for opening document in new tab (target: _blank)', () => {
      expect(app.convertLinks(urlString))
        .toBe(`<a href='${urlString}' target='_blank'>${urlString}</a>`)
    })
  })

  describe('#convertLinebreaks', () => {
    it('returns replaces \\n with <br />', () => {
      const stringWithNewLine = 'Hello\nits me...'
      expect(app.convertLinebreaks(stringWithNewLine)).toBe('Hello<br />its me...')
    })

    it('returns original strings without \\ns', () => {
      const stringWithoutNewLine = 'I was wondering if after all these years youd like to meet'
      expect(app.convertLinebreaks(stringWithoutNewLine)).toBe(stringWithoutNewLine)
    })
  })

  describe('#getData', () => {
    it('gets client ticket and currentUser as data', async (done) => {
      const resolvedMethodCall = await app.getData()
      expect(Object.keys(resolvedMethodCall))
        .toEqual(expect.arrayContaining(['ticket', 'assignee', 'currentUser']))

      expect(client.get).toHaveBeenCalled()
      done()
    })
  })
})
