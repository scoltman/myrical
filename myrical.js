var Myrical = (function() {  
  var filesRead = 0,
      words = [];
      emotions = ['fear','fearful','feared','anger','angry','angered','sorrow','sorrowful','joy','joyful','joyless','disgust','digusted','digusted','surprise','suprising','suprised','shame','shameful','ashamed','envy','envious','jealous','jealousy','wonder','wonderful','happiness','happy','happier','unhappiness','amusement','amusing','amusement','funny','funnier','weariness','weary','pride','proud','shame','ashamed','nervous','nervously','nervousness','love','loved','loving','hatred','hate','hated','jateful','hope','hoping','hoped','despair'];
  
  
  /**
   * Initialise.
   */
  var init = function() {
    $('#files').change(handleFileSelect);
  };
  
  
  /**
   * Handles multiple local file select
   */ 
  var handleFileSelect = function(evt) {
    var file = null,
        files = evt.target.files,
        fileWords = [],
        lastFile = false,
        i = 0,
        j = files.length;
    
    //reset words array;
    words = [];
    filesRead = 0;
    
    for (i, j; i < j; i++) {
      file = files[i];
      if (file) {
        readBlob(file, j);
      }
    }
  };
  
  
  /**
   * Slices blobs to create a string of file content
   */
  var readBlob = function(file, flength) {
    var reader = null,
        blob = null;
        
    reader = new FileReader();
    
    if (file.webkitSlice) {
      blob = file.webkitSlice(0, file.size);
    } else if (file.mozSlice) {
      blob = file.mozSlice(0, file.size);
    } else if (file.slice) {
      blob = file.slice(0, file.size);
    }
    
    reader.readAsBinaryString(blob);
    
    reader.onloadend = function(evt) {
      var i = 0,
          j = 0;
          
      filesRead++;
      
      if (filesRead === flength) {
        lastFile = true;
      }
      if (evt.target.readyState === FileReader.DONE) {
        var fileContents = evt.target.result;
        
        fileContents = fileContents.toLowerCase();
        
        fileWords = fileContents.match(/\b[A-Za-z']+\b/g);
        for (i = 0, j = fileWords.length; i < j; i++) {
          words.push(fileWords[i]);
        }
        
        if (lastFile) {
          processWords(words);
        }
      }
    };
  };
  
  
  /**
   * Create object of 'word' to 'frequency' relationship.
   */
  var processWords = function(words){
    var results = [],
        sameWord = '',
        word = '',
        countedWords = {},
        uniqueCount = 0,
        wordCount = words.length,
        i = 0;
        
    for (i,wordCount; i < wordCount; i++) {
      word = words[i];
      if (countedWords[word]) {
          countedWords[word].count = countedWords[word].count + 1;
      } else {
        ++uniqueCount;
        countedWords[word] = {
          name        : word,
          count       : 1,
          length      : word.length
        };
      }
    }
    
    render(countedWords, wordCount, uniqueCount);
  };
  
  /**
   * Work out the most used personal words (you,him).
   */
  var getType = function(words) {
    var realType = "something",
        pt = 0,
        ct = 0,
        key = '',
        i = 0,
        j = 0,
        type = null,
        types = {
          "you": ['i','me','my','mine'],
          "someone else": ["you","you're", "yours"],
          "her": ['her','she','hers'],
          "him": ['him','his','he'],
          "them": ['them','they','their','theirs']
        };

        for (key in types) {
           pt = 0;
           type = types[key];
           
           for (i, j = type.length; i < j; i++) {
             if (words[type[i]]) {
                pt = pt + words[type[i]].count;
             }
           }
           types[key] = pt;
           if (pt > types[realType]) {
             realType = key;
           }
        }
       
        return realType;
  };
  
  /**
   * Render words object to browser.
   */
  var render = function(countedWords, wordCount, uniqueCount){
    var percentUnique = percent(uniqueCount,wordCount),
        restNum = 100 - percentUnique,
        chart = '<img title="'+uniqueCount+' unique words" class="chart-unique" src="http://chart.apis.google.com/chart?chs=293x205&cht=p&chco=3399CC&chds=0,98.333&chd=t:'+percentUnique+','+restNum+'">',
        uniqueWords = chart+'<div class="total-words">'+percentUnique+'% Unique Words</div>',
        uniqueExamples = '<p>Such as ',
        subjectType = getType(countedWords),
        allAbout = '<p class="all-about">It\'s all about '+subjectType+'.</p>',
        sortWords = [],
        threeUnique = 0,
        mostQuestion = 1,
        key = '',
        i = 0,
        j = 0,
        questionText = '',
        questionList = '',
        questionWidth = 21,
        hasQuestions = false,
        perdec = 1,
        minLength = 1,
        emotionalness = percent(countEmotions(countedWords),wordCount),
        emoText = '',
        questionWords = {
          'what':0,
          'why':0,
          'when':0,
          'where':0,
          'how':0,
          'who':0
        };
        
    // create array of words and sort
    for (key in countedWords) {
      if (questionWords.hasOwnProperty(key)) {
        questionWords[key] = {};
        questionWords[key].count = countedWords[key].count;
        if (countedWords[key].count > mostQuestion) { mostQuestion = countedWords[key].count; }
      }
      sortWords.push(countedWords[key]);
    }
    sortWords.sort(compareLength);
    
    for (i = 0, j = sortWords.length; i < j; i++) {
      if (sortWords[i].count === 1) {
        threeUnique++;
        if (threeUnique === 3) {
          uniqueExamples = uniqueExamples + 'and ' + sortWords[i].name + ".";
          break;
        } else {
          uniqueExamples = uniqueExamples + sortWords[i].name + ", ";
        }
      }
      
    }  
    uniqueExamples = uniqueExamples + '</p>';
    minLength = (mostQuestion.toString()).length;
    
    for (key in questionWords) {
      if (questionWords[key].count > 0) {
        hasQuestions = true;
        perdec = (Math.floor((questionWords[key].count / mostQuestion) * 10));
        if (perdec < minLength) { perdec = minLength; }
        
        questionWidth = 21 * perdec;
        questionList = questionList + '<li><span style="width:' + questionWidth + 'px">' + questionWords[key].count + ' </span>' + key + '</li>';
      }
    }
    if (hasQuestions) {
      questionText = '<ul class="questions">' + questionList + '</ul>';
    }
    
    if (emotionalness > 0) {
      emoText = '<p class="emotional">With ' + emotionalness + '% emotion.</p';
    } else {
      emoText = '<p class="emotional">Without even a hint of emotion.</p>';
    }
    
    $('#content').html(questionText + uniqueWords + uniqueExamples + allAbout + emoText);
  
  };
  
  var percent = function(x,y) {
    return Math.round((x/y) * 100);
  };
  
  var countEmotions = function(countedWords){
    var emotionCount = 0,
        i = 0,
        j = emotions.length;
    for (i, j; i < j; i++) {
      if (countedWords[emotions[i]]) {
        emotionCount = emotionCount + countedWords[emotions[i]].count;
      }
    }
    
    return emotionCount;
  };
  
  var compareCount = function(a, b) {
    return b.count - a.count;
  };
  
  var compareLength = function(a, b) {
    return b.length - a.length;
  };
  
  return {
    init: init
  };
  
}());