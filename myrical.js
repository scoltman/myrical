var Myrical = (function() {
  var filesRead = 0,
      lastFile = false,
      wordCount = 0,
      uniqueCount = 0;
    
  var handleFileSelect = function(evt) {
    var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {
      readBlob(f, files.length);
    }
  }
  
  var readBlob = function(file, flength) {
    var fileWords = [],
        reader = null,
        blob = null;
    
    if (!file) {
       alert('Please select a file!');
       return;
    }
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
      filesRead++;
      if (filesRead == flength) {
        lastFile = true;
      }
      if (evt.target.readyState == FileReader.DONE) {
        var fileContents = evt.target.result;
        words = processText(fileContents);
        wordCount = words.length;
        
        if (lastFile) {
          processWords(words);
        }
      }
    };
  }
  
  var processText = function(fileContents){
    var words = [],
        fileWords = [];
    fileWords = fileContents.match(/\b[A-Za-z']+\b/g);
    for (var i = 0, j = fileWords.length, word; i < j; i++) {
      words.push(fileWords[i]);
    }
    
    return words;
  }
  
  var processWords = function(words){
    var results = [],
        sameWord = '',
        word = '',
        countedWords = {};
        
    for (var i = 0; i < words.length; i++) {
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
    
    render(countedWords);
  }
  
  
  var getType = function(words) {
    var realType = "something",
        pt = 0,
        ct = 0,
        types = {
          "you": ['I','me','my','mine'],
          "someone else": ["you","you're", "yours"],
          "her": ['her','she','hers'],
          "him": ['him','his','he'],
          "them": ['them','they','their','theirs']
        };

        for (var key in types) {
           pt = 0;
           var aTypes = types[key];
           
           for (var i = 0; i < aTypes.length; i++) {
             console.log(aTypes[i]);
             if (words[aTypes[i]]) {
               console.log(words[aTypes[i]]);
                pt = pt + words[aTypes[i]].count;
                console.log(words[aTypes[i]].count);
             }
           }
           
           console.log(key + ' - ' + pt);
           if (pt > ct) {
             (function(){
               ct = pt;
              }());
             realType = key;
           }
        }
       
        return realType;
  }
  var render = function(countedWords){
    var percentUnique = Math.round((uniqueCount/wordCount) * 100);
    var restNum = 100 - percentUnique;
    var chart = '<img class="chart-unique" src="http://chart.apis.google.com/chart?chs=293x205&cht=p&chco=3399CC&chds=0,98.333&chd=t:'+percentUnique+','+restNum+'">';
    var uniqueWords = chart+'<div class="total-words">'+percentUnique+'% Unique Words</div>';
    var uniqueExamples = '<p>Such as ';
    console.log(countedWords);  
    var subjectType = getType(countedWords);
    var allAbout = '<p class="all-about">It\'s all about '+subjectType+'.</p>';
    var sortWords = [];
    for (var k in countedWords) {
      console.log(countedWords[k]);
      sortWords.push(countedWords[k]);
    } 
  
    sortWords.sort(compareLength);
    var threeUnique = 0;

    for (var i = 0; i < sortWords.length; i++) {
      
      if (sortWords[i].count == 1) {
        threeUnique++
        if (threeUnique == 3) {
          uniqueExamples = uniqueExamples + 'and '+sortWords[i].name + ".";
          break;
        } else {
          uniqueExamples = uniqueExamples + sortWords[i].name + ", ";
        }
      }
      
    }  
    uniqueExamples = uniqueExamples + '</p>';
    
    $('#content').html(uniqueWords + uniqueExamples + allAbout);
  
  }
  
  var compareCount = function(a, b) {
    return b.count - a.count;
  }
  
  var compareLength = function(a, b) {
    return b.length - a.length;
  }
  
  var init = function(){
    $('#files').change(handleFileSelect);
  }

  return {
    init: init
  }
}());