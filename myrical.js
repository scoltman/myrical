var Myrical = (function() {
    var filesRead = 0;
    var words = [];

    var emotions = [
    'fear','fearful','feared','anger','angry','angered','sorrow',
    'sorrowful','joy','joyful','joyless','disgust','digusted','digusted',
    'surprise','suprising','suprised','shame','shameful','ashamed','envy',
    'envious','jealous','jealousy','wonder','wonderful','happiness','happy',
    'happier','unhappiness','amusement','amusing','amusement','funny','funnier',
    'weariness','weary','pride','proud','shame','ashamed','nervous','nervously',
    'nervousness','love','loved','loving','hatred','hate','hated','jateful','hope',
    'hoping','hoped','despair'];

    var types = {
          "you": ['i','me','my','mine'],
          "someone else": ["you","you're", "yours"],
          "her": ['her','she','hers'],
          "him": ['him','his','he'],
          "them": ['them','they','their','theirs']
    };

    var templates = {
        'pieChart' : '<img title="{{UNIQUECOUNT}} unique words" class="chart-unique" src="http://chart.apis.google.com/chart?chs=293x205&cht=p&chco=3399CC&chds=0,98.333&chd=t:{{PERCENTUNIQUE}},{{COUNT}}">',
        'uniqueWords' : '<div class="total-words">{{PERCENTUNIQUE}}% Unique Words</div>',
        'uniqueExamples' : '<p>Such as {{EXA1}}, {{EXA2}}, and {{EXA3}}.</p>',
        'allAbout' : '<p class="all-about">It\'s all about {{SUBJECT}}.</p>',
        'emoPercent' : '<p class="emotional">With {{EMOTIONPERCENT}}% emotion.</p>',
        'emoText' : '<p class="emotional">Without even a hint of emotion.</p>',
    };

    var init = function(){
        $('#files').change(loadSelectedFiles);
    };

    /**
     * Handles multiple local file select
     */
    function loadSelectedFiles(e) {
        if(e.target && e.target.files) {
            var files = e.target.files;
            readFiles(files);
        }
    }

    /**
    * Reads files and creates an array for words for each file
    */
    function readFiles(files) {
        var fileContents = []; //reset words list
        var ln = files.length;
        var ct = 0;
        readFile(ct);
        function readFile(ct){
            processFile(files[ct]);
        }

        function processFile(file){
            var reader = null, blob = null;
            reader = new FileReader();

            blob = getFilePath(file);
            reader.readAsBinaryString(blob);

            reader.onloadend = function(e) {
                if (e.target.readyState === FileReader.DONE) {
                    fileContents.push(getWordsFromContents(e.target.result));
                    if(ct < ln) {
                        readFile(ct++);
                    }else{
                        processFileContents(fileContents);
                    }
                }
            };

            function getFilePath(obj){
                if (obj.webkitSlice) {
                    return obj.webkitSlice(0, obj.size);
                } else if (obj.mozSlice) {
                    return obj.mozSlice(0, obj.size);
                } else if (obj.slice) {
                    return obj.slice(0, obj.size);
                }
                return {};
            }

            function getWordsFromContents(contents){
                var words = [];
                var fileWords = [];

                contents = contents.toLowerCase(); // make them lower case to match
                fileWords = contents.match(/\b[A-Za-z']+\b/g);

                for (var i = 0, j = fileWords.length; i < j; i++) {
                    words.push(fileWords[i]);
                }
                return words;
            }
        }
    }

    /**
    * Process files array containing arrays of words
    */
    function processFileContents(contents){
        var mergedContent = [];
        mergedContent = mergedContent.concat.apply(mergedContent, contents);
        processWords(mergedContent);

        function processWords(words){
            var results = [];
            var sameWord = '';
            var word = '';
            var countedWords = {};
            var uniqueCount = 0;
            
            for (var i = 0, wordCount = words.length; i < wordCount; i++) {
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
            renderCharts(countedWords, wordCount, uniqueCount);
            renderWords(countedWords, wordCount, uniqueCount);
        }
    }

  /**
   * Create object of 'word' to 'frequency' relationship.
   */

  /**
   * Work out the most used personal words (you,him).
   */
  var getType = function(words) {
    var realType = "something";

        for (var key in types) {
           var pt = 0;
           var type = types[key];
           
           for (var i, j = type.length; i < j; i++) {
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
  

  function renderWords(countedWords, wordCount, uniqueCount){
    var html = '<div style="clear:both">unique = '+uniqueCount+ '<br>count = '+wordCount+'<br><br>';

    for (var key in countedWords) {
        var obj = countedWords[key];
        html += (key + " = " + obj.count + ",<br>");
    }

    html += '</div>';
    $('#content').append(html);
  }
  /**
   * Render words object to browser.
   */
  var renderCharts = function(countedWords, wordCount, uniqueCount){

    var percentUnique = percent(uniqueCount,wordCount),
        restNum = 100 - percentUnique,
        chart = repvars(templates.pieChart, { 'UNIQUECOUNT' : uniqueCount, 'PERCENTUNIQUE' : percentUnique, 'COUNT' : restNum }),
        uniqueWords = repvars(templates.uniqueWords, { 'PERCENTUNIQUE' : percentUnique }),
        subjectType = getType(countedWords),
        allAbout = repvars(templates.allAbout, { 'SUBJECT' : subjectType }),
        sortWords = [],
        threeUnique = 0,
        mostQuestion = 1,
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
    for (var ckey in countedWords) {
      if (questionWords.hasOwnProperty(ckey)) {
        questionWords[ckey] = {};
        questionWords[ckey].count = countedWords[ckey].count;
        if (countedWords[ckey].count > mostQuestion) { mostQuestion = countedWords[ckey].count; }
      }
      sortWords.push(countedWords[ckey]);
    }
    sortWords.sort(compareLength);
    var uniqueExamples = '',
        tWords = [];

    for (var i = 0, j = sortWords.length; i < j; i++) {
      if(sortWords[i].count === 1) tWords.push(sortWords[i].name);
      if (tWords.length === 3) {
        uniqueExamples = repvars(templates.uniqueExamples, { 'EXA1' : tWords[0], 'EXA2' : tWords[1], 'EXA3' : tWords[2] });
        break;
      }
    }
    
    minLength = (mostQuestion.toString()).length;
    
    for (var qkey in questionWords) {
      if (questionWords[qkey].count > 0) {
        hasQuestions = true;
        perdec = (Math.floor((questionWords[qkey].count / mostQuestion) * 10));
        if (perdec < minLength) { perdec = minLength; }
        
        questionWidth = 21 * perdec;
        questionList = questionList + '<li><span style="width:' + questionWidth + 'px">' + questionWords[qkey].count + ' </span>' + qkey + '</li>';
      }
    }
    if (hasQuestions) {
      questionText = '<ul class="questions">' + questionList + '</ul>';
    }
    
    if (emotionalness > 0) {
      emoText = repvars(templates.emoPercent, {'EMOTIONPERCENT' : emotionalness });
    } else {
      emoText = templates.emoText;
    }
    
    $('#content').html(questionText + chart + uniqueWords + uniqueExamples + allAbout + emoText);
  
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

  var repvars = function(s, strvars) {
    for(var vkey in strvars){
      s = s.replace('{{' + vkey + '}}', strvars[vkey]);
    }
    return s;
  };

  return {
    init: init
  };

}());
  