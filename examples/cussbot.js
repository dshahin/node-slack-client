var Slack, autoMark, autoReconnect, slack, token;

Slack = require('..');

var jQuery = require('jQuery'),
    scoreboard_filename = "./swear_scoreboard.json",
    fs = require("fs");
    token = process.env.JERKBOT_KEY,
    bad_words = require(scoreboard_filename);

    console.log('score:', bad_words);

autoReconnect = true;

autoMark = true;

slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  var channel, channels, group, groups, id, messages, unreads;
  channels = [];
  groups = [];
  unreads = slack.getUnreadCount();
  channels = (function() {
    var _ref, _results;
    _ref = slack.channels;
    _results = [];
    for (id in _ref) {
      channel = _ref[id];
      if (channel.is_member) {
        _results.push("#" + channel.name);
      }
    }
    return _results;
  })();
  groups = (function() {
    var _ref, _results;
    _ref = slack.groups;
    _results = [];
    for (id in _ref) {
      group = _ref[id];
      if (group.is_open && !group.is_archived) {
        _results.push(group.name);
      }
    }
    return _results;
  })();
  console.log("Welcome to Slack. You are @" + slack.self.name + " of " + slack.team.name);
  console.log('You are in: ' + channels.join(', '));
  console.log('As well as: ' + groups.join(', '));
  messages = unreads === 1 ? 'message' : 'messages';
  return console.log("You have " + unreads + " unread " + messages);
});

slack.on('message', function(message) {
  var channel, channelError, channelName, errors, response, text, textError, ts, type, typeError, user, userName;
  channel = slack.getChannelGroupOrDMByID(message.channel);
  user = slack.getUserByID(message.user);
  response = '';
  type = message.type, ts = message.ts, text = message.text;
  channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
  channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
  userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";
  console.log("Received: " + type + " " + channelName + " " + userName + " " + ts + " \"" + text + "\"");
  var random = Math.floor(Math.random() * 20) + 1
  if (type === 'message' && (text != null) && itcontains(text,keywords)) {
    response = parseNaughty(text);
    channel.send( "cussbot scoreboard:" + response);
    return console.log("@" + slack.self.name + " responded with \"" + response  + "\"");
  } else {
    typeError = type !== 'message' ? "unexpected type " + type + "." : null;
    textError = text == null ? 'text was undefined.' : null;
    channelError = channel == null ? 'channel was undefined.' : null;
    errors = [typeError, textError, channelError].filter(function(element) {
      return element !== null;
    }).join(' ');
    return console.log("@" + slack.self.name + " could not respond. " + errors);
  }
});

slack.on('error', function(error) {
  return console.error("Error: " + error);
});

slack.login();

var itcontains = function(input, matches){
  var str = input.toLowerCase();
  console.log('str',str);
  for(var i=0,len=matches.length;i<len;i++){
    
    var thing = matches[i];
    if(str.indexOf(thing) > -1){
      return true;
    }
  }
  console.log('no match' + matches[i]);
  return false;
}



var keywords = [];

for(var swear in bad_words){
  keywords.push(swear);
}

var parseNaughty = function(txt){
  var orig = txt.toLowerCase();
  console.log('orig', orig)
  var swears = keywords.join('|'),
      re = new RegExp(swears,'gi'),
      matches =  orig.match(re);
  if(matches){
    for (var i=0;i<matches.length;i++){
        bad_words[matches[i]] += 1;
    }
    saveScoreboard(bad_words);
    return JSON.stringify(bad_words);
  }
}

var saveScoreboard = function(data){
    var dataString = JSON.stringify( data );
    fs.writeFile( "examples/" + scoreboard_filename, dataString , "utf8", function(){
      console.log('file saved',dataString);
    } );
}
