var fs = require('fs');

function browseLocalesDirectory()
{
  return fs.readdirSync('src/locales');
}

function getLocalesFiles(directoryFiles)
{
  // Get content of every file of the 'locales' directory
  let translationsFiles = [];

  for(let i=0; i<directoryFiles.length; ++i)
  {
    translationsFiles.push(fs.readFileSync('src/locales/'+directoryFiles[i], {  encoding: 'utf8'  }));
    if(directoryFiles[i]=='en.ts')
    {
      translationsFiles.unshift(translationsFiles.pop());
      directoryFiles.unshift(directoryFiles.splice(i,1)[0]);
    }
  }

  return translationsFiles;
}

function removeComments(content)
{
  // Remove comments
  let currentCharacter = 'A'.charCodeAt();
  for(let index=0;index<26; ++index)
  {
    content = content.replace("//"+String.fromCharCode(currentCharacter++),"");
  }

  return content;
}

function checkEntries(files)
{
  for(let i=1;i<files.length;++i)
  {
    for(let currentEntry in files[0])
    {
      if(!files[i][currentEntry])
      {
        files[i][currentEntry] = '';
      }
    }
  }
}

function beautifyAndWriteFile(JSONContent, beforeEqualText, filepath)
{
  let content = JSON.stringify(JSONContent);
  content = beforeEqualText + '\n' + content;
  content = content.replace('{','{  ');
  content = content.replace(/","/gi,'",\n  "');
  content = content.replace('}','\n}');

  let currentCharacter = 'a'.charCodeAt(),
    currentUpperCaseCharacter = 'A'.charCodeAt();
  for(let index=0; index<26; ++index)
  {
    content = content.replace('  "'+String.fromCharCode(currentCharacter),'\n  //'+String.fromCharCode(currentUpperCaseCharacter++)+'\n  "'+String.fromCharCode(currentCharacter++))
  }

  fs.writeFileSync(filepath, content);
}

function i18nAddMissingEntries()
{
  let directoryFiles = browseLocalesDirectory();

  let translationsFiles = getLocalesFiles(directoryFiles);

  let translationsFilesJSON = [],
    beforeEqualTexts = [];

  for(let index=0; index<translationsFiles.length; ++index)
  {
    let equalPosition = translationsFiles[index].indexOf('=');
    beforeEqualTexts.push(translationsFiles[index].substring(0, equalPosition+1));
    translationsFilesJSON[index] = JSON.parse(removeComments(translationsFiles[index].substring(equalPosition+1)));
  }

  checkEntries(translationsFilesJSON);

  // No need to write the 'en.ts' file because it is our default file
  translationsFilesJSON.shift();
  beforeEqualTexts.shift();
  directoryFiles.shift();

  for(let index=0; index<translationsFilesJSON.length; ++index)
  {
    beautifyAndWriteFile(translationsFilesJSON[index], beforeEqualTexts[index], 'src/locales/'+directoryFiles[index]);
  }
}

module.exports = i18nAddMissingEntries;