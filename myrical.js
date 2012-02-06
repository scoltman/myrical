var Myrical = (function() {
  var words = [],
      filesRead = 0,
      lastFile = false,
      wordCount = 0,
      uniqueCount = 0,
      countedWords = [];
    
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
     } else if (file.slice){
       blob = file.slice(0, file.size);
     }
   
     reader.readAsBinaryString(blob);
   
     reader.onloadend = function(evt) {
         filesRead++;
         if(filesRead == flength){
             lastFile = true;
         }
         if (evt.target.readyState == FileReader.DONE) {
             var fileContents = evt.target.result;
           
             fileWords = fileContents.match(/\b[A-Za-z']+\b/g);
             for (var i = 0, j = fileWords.length, word; i < j; i++){
                 words.push(fileWords[i]);
             }
             wordCount = words.length;
             if(lastFile){
               processWords(words);
             }
         }
     };
  }

  var processWords = function(words){
    var results = [],
        sameWord = '',
        word = ''; 
  
    for(var i = 0; i < words.length; i++) {
      word = words[i];
      if (countedWords[word]){
          countedWords[word].count = countedWords[word].count + 1;
      }else{
          ++uniqueCount;
          countedWords[word] = {
              name        : word,
              count       : 1,
              length      : word.length
          };
      }
    }
    
    render();
  }
  
  var render = function(){
    
    var totalSummary = '<div class="total-words">total words: '+ wordCount + '</div>';
    var uniqueSummary = '<div class="unique-words">unique words: ' + uniqueCount +'</div>';
    var topThree = '<div class="top-three">top three used words: ';
    var longestWords = '<div class="longest">top three longest words: ';
    var sortWords = [];
    for (var k in countedWords) {
      sortWords.push(countedWords[k]);
    } 
  
    sortWords.sort(compareCount);
    
    for(var i = 0; i < 3; i++){
      topThree = topThree + sortWords[i].name+': '+ sortWords[i].count+", ";  
    }  
    topThree = topThree + '</div>';
    
    sortWords.sort(compareLength);
    
    for(var i = 0; i < 3; i++){
      longestWords = longestWords + sortWords[i].name + ", ";  
    }  
    longestWords = longestWords + '</div>';
    
    $('#content').html(totalSummary + uniqueSummary + topThree + longestWords);
  
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