(function() {

  return {

    requests: { },

    events: {
      'app.activated':                      'renderText',
      'ticket.assignee.user.id.changed':    'renderText',
      'ticket.assignee.user.name.changed':  'renderText',
      'ticket.assignee.user.email.changed': 'renderText',
      'ticket.requester.id.changed':        'renderText',
      'ticket.requester.name.changed':      'renderText',
      'ticket.requester.email.changed':     'renderText',
      'ticket.type.changed':                'renderText',
      'ticket.subject.changed':             'renderText',
      'ticket.priority.changed':            'renderText',
      'ticket.status.changed':              'renderText',
      'ticket.tags.changed':                'renderText',
      'ticket.collaborators.changed':       'renderText',
      'ticket.external_id.changed':         'renderText',

    },

    renderText: function() {

      var textBody;

      textBody = this.convertPlaceholders(this.settings.textBody);
      textBody = this.convertHTML(textBody);
      textBody = this.convertLinks(textBody);

      this.switchTo('default', { textBody: this.convertLinebreaks(textBody) });
    },

    convertHTML: function(string) {
      string = string.replace(/</g, '&lt;');
      string = string.replace(/>/g, '&gt;');

      return string;
    },

    convertLinebreaks: function(string) {
      return string.replace(/\n\r?/g, '<br />');
    },

    convertLinks: function(string) {
      // Thanks to github:bryanwoods for the pattern
      var urlPattern = /(^|\s)(\b(https?):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|]\b)/ig,
          linkTarget = (this.settings.openLinksInTabs) ? '_self' : '_blank';

          console.log(this.settings.openLinksInTabs);

      return string.replace(urlPattern, "$1<a href='$2' target='" + linkTarget + "'>$2</a>");
    },

    convertPlaceholders: function(string) {
      var regexPlaceholder = new RegExp("({{)(.*?)(}})", "g"),
               regexSymbol = new RegExp("({{|}})", "g"),
                strMatches = string.match(regexPlaceholder);

      if (strMatches) {
        for (var i=0; i<strMatches.length; i++) {
          var curMatch = strMatches[i];
          var curMatchStripped = curMatch.replace(regexSymbol, '');
          var curMatchReplaced = curMatch.replace(regexPlaceholder, this.matchPlaceholder(curMatchStripped));
          string = string.replace(curMatch, curMatchReplaced);
        }
      }

      return string;

    },

    matchPlaceholder: function(placeholderStripped) {
      try {
        switch(placeholderStripped) {
          case 'ticket.id':
            return this.ticket().id();
          case 'ticket.subject':
            return this.ticket().subject();
          case 'ticket.status':
            return this.ticket().status();
          case 'ticket.priority':
            return this.ticket().priority();
          case 'ticket.type':
            return this.ticket().type();
          case 'ticket.requester.id':
            return this.ticket().requester().id();
          case 'ticket.requester.name':
            return this.ticket().requester().name();
          case 'ticket.requester.email':
            return this.ticket().requester().email();
          case 'ticket.assignee.id':
            var userId = this.ticket().assignee().user();
            return (userId) ? userId.id() : '';
          case 'ticket.assignee.name':
            var userName = this.ticket().assignee().user();
            return (userName) ? userName.name() : '';
          case 'ticket.assignee.email':
            var userEmail = this.ticket().assignee().user();
            return (userEmail) ? userEmail.email() : '';
          case 'ticket.tags':
            var ticketTags = this.ticket().tags();
            return ticketTags.join(', ');
          case 'current_user.id':
            return this.currentUser().id();
          case 'current_user.name':
            return this.currentUser().name();
          case 'current_user.email':
            return this.currentUser().email();
          case 'ticket.external_id':
            return this.ticket().external().id();
          case 'ticket.externalid':
            return this.ticket().externalid();
          //case 'ticket.instanceid':
            //return this.ticket().custom_fields
            
            
            
          default:
            return placeholderStripped;
        }
      } catch(e) {
        console.error(placeholderStripped + ' cannot be interpolated');
      }
    }

  };

}());
