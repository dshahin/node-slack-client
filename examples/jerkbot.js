var Slack, autoMark, autoReconnect, slack, token;

Slack = require('..');
var jQuery = require('jQuery');


token = process.env.JERKBOT_KEY;

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
  if (type === 'message' && (text != null) && (channelName != '#general') && itcontains(text,keywords)) {
    //response = text.split('').reverse().join('') + ' :poop:';
    response = markov(markovOptions,markovSourceText);
    channel.send(response + ' :mrt:');
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

var itcontains = function(str, matches){
  //var str = this;
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


function markov(options,input){
    //options = $.extend({}, $.markovmaker.options, options);
    terminals = {}; //properties are last words in sentences
    startwords = []; //values are first words in sentences
    wordstats = {}; // the markov chain 
    
    //split the input text into sentences
    sentences = input.split(options.punctuation_marks);
    //for each sentence
    for (var i = 0; i < sentences.length; i++) {
        //split sentence into words
        var words = sentences[i].split(options.word_splitter);
        //take note of last word in sentence
        terminals[words[words.length - 1]] = true;
        //take note of first word
        startwords.push(words[0]);
        //for each word
        for (var j = 0; j < words.length - 1; j++) {
            //build an object with word as property
            //pointing to an arry of words that come after it
            var thisWord = words[j],
                nextWord = words[j + 1];
            //optimization
            if(thisWord !== '' && nextWord !== null){
                if (!wordstats.hasOwnProperty(thisWord)) {
                    //first time we've seen this word
                    //create an array with the next word in it
                    wordstats[thisWord] = [nextWord];
                } else {
                    //not first time for this word
                    //push next word into existin array
                    wordstats[thisWord].push(nextWord);
                }
            }
        }
    }
    
    //add a period to end of sentence
    var output =  make_sentence(options.min_length) ;
    return output + options.punctuation;
  }

  //given an array, return a random element
  var choice = function (a) {
      var i = Math.floor(a.length * Math.random());
      return a[i];
  };

  var make_sentence = function (min_length) {
      //pick a random starting word
      var word = choice(startwords);
      //start a new sentence
      var sentence = [word];
      //pick our word from the stats object
      while (wordstats.hasOwnProperty(word)) {
          //get the array of words that follow this word
          var next_words = wordstats[word];
          //choose one randomly
          word = choice(next_words);
          //add to our sentence
          sentence.push(word);
          //check sentence length and if we are on a terminal word
          if (sentence.length > min_length && terminals.hasOwnProperty(word)){
              break;
          }
      }
      //if sentence is too short, try again
      if (sentence.length < min_length){
        return make_sentence(min_length);
      }
      //join the words with spaces
      return sentence.join(' ');
  };

var keywords = ['foobar','Jarrett','jarrett','jarret','Jarret', 'asshole', 'jerkbot', 'jb3k','JB3K','Jerkbot','jerk','j3rk'];

var markovOptions = {
    punctuation: '.',
    min_length : 25,
    punctuation_marks: /\.|\;|\?|\:|\n/,
    word_splitter: /\s/
};


var markovSourceText = "I guess the doppelganger I saw was a hallucination, sort of like the nightly discussions that I carried on with Rodolfo for months.  I will stay off the drug, during work hours that is. So, was there a Jason Dodds doppelganger in the room with you guys yesterday during the All Heads Meeting? So, I pinged him this morning and asked him was he in Cali.  I got to see Matt also.  Did you know that Matt is a snappy dresser? Of course, I got a smart ass answer from him, and an argument ensued about me confusing him with Eddie, Bobby, and Dan.  Unless Dan invested in a hair piece, then I don't think I saw Dan yesterday on camera. It got so heated I was about to say maybe we should meet up to duke it out or have a dance off (we live 15 - 20 minutes away from each other I think).  Most likely, a dance off since my hand is still mangled.  A pimp slap would not take down a man the size of Dodds. Was it the Taco or was it some other type of Meat? Oh okay, he took her out to eat I was told it was only dinner. Jarrett stop thinking like a sinner. So, Spoon has game like Rodolfo? Whose tactics are often like Gestapo. Spoon showing off the taco meat. Why don't we talk anymore?  We used to be so close.  My first project at CodeScience was working with you on NetworkFleet, and we kicked butt!  We finished the project weeks in advance. Anyways, I plan to make my trek to the west coast in a few months, and I need a place to stay.  I know am 31-years old, but would your family adopt me?  Please say yes, so I can finally live out my 80s fantasies (Click to find out).  My real family is mean :(.  I cook, clean, and have my own money a lot of it!, what more could you want? You see how happy that family is in that video?  That could be us!  Of course, I would have to shave continuously, but it would work.  Now, how are we going to do this?  Video where I live in the house downstairs?  Or where I live over the garage, and occasionally come around with an aaaayyyyyeeeee!, wink, and double thumbs up? If it is Video B, then I already have the S-Medium leather jacket, but I would have to take coolness elocution lessons from Jake, along with borrowing his motorcycle a cool guy like him should have one, right?, to pull it off.  Remember, Mary, this is out in the public, so you have to nod your head Yes with an uncomfortable grin on your face to keep up the nice person facade.  My people will contact your people.  Thanks. PS.  Ill take your silence as a No.  I'll talk with Chad to see if I can stay in the Playa's Den.  Thanks. This is why you need to limit your beer/wine intake to one bottle/glass per night because you miss important details like this one.  I would have been pissed if I arrived at SFO with no where to go. I found out a few weeks ago that Mary didn't even read this email.  Mama, you've been bad. I know being an asshole is a full-time job, but don't stay gone too long from your pimping duties next time...  You have a lot of young and grimy pimps out here trying to make a name for themselves out here whether they on our team or not. I am actually clairvoyant, or maybe it's a personality disorder, which make my jokes so funny.";
  
