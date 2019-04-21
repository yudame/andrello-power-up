/* global TrelloPowerUp */

// we can access Bluebird Promises as follows
window.Promise = TrelloPowerUp.Promise;

var ANDRELLO_ICON = 'https://cdn.glitch.com/3edcc571-a9a4-4249-ae6e-88bff229ff75%2Fjoy.png?1555757158271';

var WHITE_ICON = 'https://cdn.glitch.com/3edcc571-a9a4-4249-ae6e-88bff229ff75%2F9FCB021F-CEDB-43B4-9339-3BF12C5DEAEC.png?1555861308289';
var BLACK_ICON = 'https://cdn.glitch.com/3edcc571-a9a4-4249-ae6e-88bff229ff75%2F7BA0338A-2DC1-43F0-A464-FBC75F737748.png?1555861308704';



// helper function to fetch data and generate card badges
var getBadge = function(t, detail) {
  return t.getAll()
  .then(function(storedData){
    if (!storedData || !storedData.card || !storedData.card.shared) {
      return [];
    }
    
    var data = storedData.card.shared;
    if (!data.unixTime || new Date(data.unixTime * 1000) < Date.now()) {
      return [];
    }
    
    return t.card('id', 'closed')
    .then(function(card){
      if (data.idCard !== card.id || !card.closed) {
        $.post('/snooze/' + card.id + '/verify', function(){
          t.set('card', 'shared', { idCard: null, time: null, unixTime: null });
        });
        return [];
      }
      var badge = {
        icon: 'https://cdn.hyperdev.com/07656aca-9ccd-4ad1-823c-dbd039f7fccc%2Fzzz-grey.svg'
      };
      if (detail) {
        badge.title = 'Card Snoozed Until';
        badge.text = data.time;
      }
      return [badge];
    })
    .catch(function(){
      return [];
    });
  })
  .catch(function(){
    return [];
  });
};





TrelloPowerUp.initialize({
  // Start adding handlers for your capabilities here!
  
  'board-buttons': function (t, opts) {
    var board_id = t.board('id')
    
    return [
      {
        // we can either provide a button that has a callback function
        icon: {
          dark: WHITE_ICON,
          light: BLACK_ICON
        },
        text: 'Andrello',
        callback: function(t) {
            return t.popup({
              title: "Andrello",
              url: './board-options.html',
              height: 200
            });
        },
        condition: 'edit'
      }, 
      {
        // or we can also have a button that is just a simple url
        // clicking it will open a new tab at the provided url
        icon: {
          dark: WHITE_ICON,
          light: BLACK_ICON
        },
        text: 'View Live Site',
        condition: 'always',
        url: 'https://andrello-api-production.herokuapp.com/trello/setup?board_id='+board_id,
        target: 'Inspiring Boards' // optional target for above url
      }
    ];
  },
  
  //'card-badges': function(t){
  //  return getBadge(t, false);
  //},
  
	'card-buttons': function(t, options) {
    // check that viewing member has write permissions on this board
    if (options.context.permissions.board !== 'write') {
      return [];
    }
    // return t.set("member", "shared", "hello", "world")
    
    return t.get('member', 'private', 'token')
    .then(function(token){
      return [{
        icon: ANDRELLO_ICON,
        text: 'Andrello',
        callback: function(t) {
          if (!token) {
            return t.popup({
              title: 'Authorize Your Account',
              url: './auth.html',
              height: 75
            });
          } else {
            return t.popup({
              title: "Andrello",
              url: './card-options.html',
              height: 75
            });
          }
        }
      }];
    });
	},
  
  'card-detail-badges': function(t, options){
    var editable = options.context.permissions.board === 'write';
    // var clickCallback = function(context){
    //   return context.popup({
    //     title: 'Published',
    //     url: './set-publish-date.html',
    //     height: 411 // initial height of popup window
    //   });
    // };
    return getBadge(t, true)
    // .then(function(badges){
    //   if (badges && badges.length === 1 && editable) {
    //     // add callback if editable
    //     badges[0].callback = clickCallback;
    //   }
    //   return badges;
    // })
    .catch(function(){
      return [];
    });
  }
  
});
