/* Copyright (c) 2012-2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. 
 *
 * TODO: Implement conversion between tag methods. */
/* global define  */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading tagutils.js ...');
  var TSCORE = require('tscore');
  var BEGIN_TAG_CONTAINER = '[';
  var END_TAG_CONTAINER = ']';
  var TAG_FILE_EXTENSION = '.tags';
  var TAG_DATABASE_NAME = '.tagspacesdb';
  var tagDatabaseTemplate = {
    '_id': undefined,
    'tags': undefined
  };

  function extractFileName(filePath) {
    return filePath.substring(filePath.lastIndexOf(TSCORE.dirSeparator) + 1, filePath.length);
  }

  function cleanTrailingDirSeparator(dirPath) {
    if (dirPath !== undefined) {
      if (dirPath.lastIndexOf('\\') === dirPath.length - 1) {
        return dirPath.substring(0, dirPath.length - 1);
      } else if (dirPath.lastIndexOf('/') === dirPath.length - 1) {
        return dirPath.substring(0, dirPath.length - 1);
      } else {
        return dirPath;
      }
    } else {
      console.error('Directory Path ' + dirPath + ' undefined');
    }
  }

  function extractFileNameWithoutExt(filePath, tagMethod) {
    var fileName = extractFileName(filePath);
    var indexOfDot = fileName.lastIndexOf('.');
    if (undefined === tagMethod)
      tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;

    if (tagMethod === "1") {
      if (indexOfDot > 0)
        return fileName.substring(0, indexOfDot);
      else
        return fileName;
    }

    var lastIndexBeginTagContainer = fileName.lastIndexOf(BEGIN_TAG_CONTAINER);
    var lastIndexEndTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);
    if (lastIndexBeginTagContainer === 0 && lastIndexEndTagContainer + 1 === fileName.length) {
      // case: "[tag1 tag.2]"
      return '';
    } else if (indexOfDot > 0) {
      // case: regular
      return fileName.substring(0, indexOfDot);
    } else if (indexOfDot === 0) {
      // case ".txt"
      return '';
    } else {
      return fileName;
    }
  }

  function extractFileNameWithoutTags(filePath, tagMethod) {
    if (undefined === tagMethod) {
      tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
    }
    if (tagMethod === "2") {
      return filePath;

    } else if (tagMethod === "1") {
      return filePath;

    } else {
      var fileTitle = extractTitle(filePath, tagMethod);
      var fileExt = extractFileExtension(filePath);
      var containingDirectoryPath = extractContainingDirectoryPath(filePath);
      if (fileExt.length > 0) {
        fileExt = '.' + fileExt;
      }
      var newFilePath = containingDirectoryPath + TSCORE.dirSeparator + fileTitle + fileExt;
        return newFilePath;
    }
  }

  function stringEndsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function extractContainingDirectoryPath(filePath) {
    return filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
  }

  function extractParentDirectoryPath(dirPath) {
    if (stringEndsWith(dirPath, TSCORE.dirSeparator)) {
      dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
    }
    return dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
  }

  function extractDirectoryName(dirPath) {
    if (stringEndsWith(dirPath, TSCORE.dirSeparator)) {
      dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
    }
    return dirPath.substring(dirPath.lastIndexOf(TSCORE.dirSeparator) + 1, dirPath.length);
  }

  function extractContainingDirectoryName(filePath) {
    var tmpStr = filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
    return tmpStr.substring(tmpStr.lastIndexOf(TSCORE.dirSeparator) + 1, tmpStr.length);
  }

  function extractFileExtension(filePath) {
    var lastindexDirSeparator = filePath.lastIndexOf(TSCORE.dirSeparator);
    var lastIndexEndTagContainer = filePath.lastIndexOf(END_TAG_CONTAINER);
    var lastindexDot = filePath.lastIndexOf('.');
    if (lastindexDot < 0) {
      return '';
    } else if (lastindexDot < lastindexDirSeparator) {
      // case: "../remote.php/webdav/somefilename"
      return '';
    } else if (lastindexDot < lastIndexEndTagContainer) {
      // case: "[20120125 89.4kg 19.5% 60.5% 39.8% 2.6kg]"
      return '';
    } else {
      return filePath.substring(lastindexDot + 1, filePath.length).toLowerCase().trim();
    }
  }

  function extractTitle(filePath, tagMethod) {
    console.log('Extracting title from: ' + filePath);
    if (undefined === tagMethod)
      tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
    var fileName = extractFileNameWithoutExt(filePath, tagMethod);
    if (tagMethod === "2" || tagMethod === "1")
      return fileName;
    var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
    var endTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);
    /* cases like "", "t", "[" 
        if( fileName.length <= 1) {
        // cases like "asd ] asd ["
        else if (beginTagContainer > endTagContainer) {
        // case: [ not found in the filename
        else if ( beginTagContainer < 0 ) 
        else if ( endTagContainer < 0 ) */
    if (beginTagContainer >= 0 && beginTagContainer < endTagContainer) {
      if (beginTagContainer === 0 && endTagContainer === fileName.trim().length) {
        // case: "[tag1, tag2]"
        return '';
      } else if (endTagContainer === fileName.trim().length) {
        // case: "asd[tag1, tag2]"
        return fileName.slice(0, beginTagContainer);
      } else {
        // case: "title1 [tag1 tag2] title2"
        return fileName.slice(0, beginTagContainer) + fileName.slice(endTagContainer + 1, fileName.length);
      }
    } else {
      return fileName;
    }
  }

  function formatFileSize(sizeInBytes, siSystem) {
    var threshold = siSystem ? 1000 : 1024;
    if (sizeInBytes < threshold) {
      return sizeInBytes + ' B';
    }
    var units = siSystem ? [
      'kB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB'
    ] : [
      'KiB',
      'MiB',
      'GiB',
      'TiB',
      'PiB',
      'EiB'
    ];
    var cUnit = -1;
    do {
      sizeInBytes /= threshold;
      ++cUnit;
    } while (sizeInBytes >= threshold);
    return sizeInBytes.toFixed(1) + ' ' + units[cUnit];
  }

  function formatDateTime(date, includeTime) {
    if (date === undefined || date === '') {
      return '';
    }
    var d = new Date(date);
    var cDate = d.getDate();
    cDate = cDate + '';
    if (cDate.length === 1) {
      cDate = '0' + cDate;
    }
    var cMonth = d.getMonth();
    cMonth++;
    cMonth = cMonth + '';
    if (cMonth.length === 1) {
      cMonth = '0' + cMonth;
    }
    var cYear = d.getFullYear();
    var cHour = d.getHours();
    cHour = cHour + '';
    if (cHour.length === 1) {
      cHour = '0' + cHour;
    }
    var cMinute = d.getMinutes();
    cMinute = cMinute + '';
    if (cMinute.length === 1) {
      cMinute = '0' + cMinute;
    }
    var cSecond = d.getSeconds();
    cSecond = cSecond + '';
    if (cSecond.length === 1) {
      cSecond = '0' + cSecond;
    }
    var time = '';
    if (includeTime) {
      time = ' - ' + cHour + ':' + cMinute + ':' + cSecond;
    }
    return cYear + '.' + cMonth + '.' + cDate + time;
  }

  function formatDateTime4Tag(date, includeTime, includeMS) {
    if (date === undefined || date === '') {
      return '';
    }
    var d = new Date(date);
    var cDate = d.getDate();
    cDate = cDate + '';
    if (cDate.length === 1) {
      cDate = '0' + cDate;
    }
    var cMonth = d.getMonth();
    cMonth++;
    cMonth = cMonth + '';
    if (cMonth.length === 1) {
      cMonth = '0' + cMonth;
    }
    var cYear = d.getFullYear();
    var cHour = d.getHours();
    cHour = cHour + '';
    if (cHour.length === 1) {
      cHour = '0' + cHour;
    }
    var cMinute = d.getMinutes();
    cMinute = cMinute + '';
    if (cMinute.length === 1) {
      cMinute = '0' + cMinute;
    }
    var cSecond = d.getSeconds();
    cSecond = cSecond + '';
    if (cSecond.length === 1) {
      cSecond = '0' + cSecond;
    }
    var time = '';
    if (includeTime) {
      time = '-' + cHour + '' + cMinute + '' + cSecond;
    }
    var milliseconds = '';
    if (includeMS) {
      milliseconds = '-' + d.getMilliseconds();
    }
    return cYear + '' + cMonth + '' + cDate + time + milliseconds;
  }

  function convertStringToDate(dateString) {
    if (dateString === undefined || dateString === '') {
      return false;
    }
    if (dateString.length === 8) {
      return new Date(dateString.substring(0, 4) + '-' + dateString.substring(4, 6) + '-' + dateString.substring(6, 8));
    } else {
      return false;
    }
  }

  function extractTags(filePath, tagMethod) {
    if (undefined === tagMethod) {
      tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
    }
    if (tagMethod === "2")
      console.log('Extracting tags from database');
    else if (tagMethod === "1")
      console.log('Extracting tags from: ' + filePath + TAG_FILE_EXTENSION);
    else
      console.log('Extracting tags from: ' + filePath);

    var fileName = extractFileName(filePath);
    // WithoutExt
    var tags = [];
    if (tagMethod === "2") {
      // Get tags from database.
      try {
        var doc = TSCORE.IO.readDatabase(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, filePath);
        tags = doc.tags;
      } catch(err) {
        console.log(err);
        return [];
      }

    } else if (tagMethod === "1") {
      // Read tags from the tag file.
      try {
        tags = TSCORE.IO.readFileSync(filePath + TAG_FILE_EXTENSION);
      } catch (err) {
        // Throw again if error is not of type 'file-not-found'.
        if (err.code !== 'ENOENT') throw err;

        console.log('No tag file created yet. Aborting extraction.');
        return [];        
      }

    } else {
      // Get tags from filename.
      tags = fileName;
      
    }
    
    var beginTagContainer = tags.indexOf(BEGIN_TAG_CONTAINER);
    var endTagContainer = tags.indexOf(END_TAG_CONTAINER);
    if (beginTagContainer < 0 || endTagContainer < 0 || beginTagContainer >= endTagContainer) {
      console.log('Filename does not contains tags. Aborting extraction.');
      return [];
    }
    var cleanedTags = [];
    var tagContainer = tags.slice(beginTagContainer + 1, endTagContainer).trim();
    tags = tagContainer.split(TSCORE.Config.getTagDelimiter());
    for (var i = 0; i < tags.length; i++) {
      // Min tag length set to 1 character
      if (tags[i].trim().length > 0) {
        cleanedTags.push(tags[i]);
      }
    }
    console.log('Extracting finished ');
    return cleanedTags;
  }

  // Use originalFilePath when copying/moving files.
  function convertTags(filePath, oldMethod, newMethod, originalFilePath) {
    if (undefined === originalFilePath) {
      originalFilePath = filePath;
    }
    var oldTags = extractTags(originalFilePath, oldMethod);
    if (oldTags.length > 0) {
      var cleanedFilePath = cleanFileFromTags(filePath, oldMethod);
      if (cleanedFilePath)
        writeTagsToFile(cleanedFilePath, oldTags, newMethod, true);
      else
        return false;
    }
    return true;
  }

  function copyFile(sourceFilePath, targetFilePath, withTags) {
    var oldMethod = TSCORE.Config.getLocation(sourceFilePath).tagMethod;
    var newMethod = "1";  // TODO: Make this default export tag method available in settings.
    if (undefined !== targetFilePath) {
      if (TSCORE.Config.getLocation(targetFilePath) !== undefined) {
        // File is being copied/moved to another tagspaces directory.
        newMethod = TSCORE.Config.getLocation(targetFilePath).tagMethod;
      }
    }

    var cleanedTargetFilePath = extractFileNameWithoutTags(targetFilePath, oldMethod);
    var tags = extractTags(sourceFilePath);
    cleanedTargetFilePath = generateFileName(cleanedTargetFilePath, tags, newMethod);
    TSCORE.IO.copyFile(sourceFilePath, cleanedTargetFilePath, true, false, function(err) {
      if (!err) {
        if (withTags && (tags.length > 0) ) {
          writeTagsToFile(cleanedTargetFilePath, tags, newMethod, true);
        }
      }
      TSCORE.hideWaitingDialog();
    });
  }

  function renameFile(sourceFilePath, targetFilePath, withTags) {
    var oldMethod = TSCORE.Config.getLocation(sourceFilePath).tagMethod;
    var newMethod = "1";  // TODO: Make this default export tag method available in settings.
    if (undefined !== targetFilePath) {
      if (TSCORE.Config.getLocation(targetFilePath) !== undefined) {
        // File is being copied/moved to another tagspaces directory.
        newMethod = TSCORE.Config.getLocation(targetFilePath).tagMethod;
      }
    }

    var cleanedTargetFilePath = extractFileNameWithoutTags(targetFilePath, oldMethod);
    var tags = extractTags(sourceFilePath);
    cleanedTargetFilePath = generateFileName(cleanedTargetFilePath, tags, newMethod);
    TSCORE.IO.renameFile(sourceFilePath, cleanedTargetFilePath, true, false, function(err) {
      if (!err) {
        if (withTags && (tags.length > 0) ) {
          writeTagsToFile(cleanedTargetFilePath, tags, newMethod, true);
          cleanFileFromTags(sourceFilePath, oldMethod);
        }
      }
      TSCORE.hideWaitingDialog();
    });
  }

  function suggestTags(filePath) {
    console.log('Suggesting tags for: ' + filePath);
    var fileName = extractFileName(filePath);
    var tags;
    var tagContainer;
    var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
    if (beginTagContainer < 0) {
      tagContainer = fileName.slice(0, fileName.lastIndexOf('.')).trim();
    } else {
      tagContainer = fileName.slice(0, beginTagContainer).trim();
    }
    // Splitting filename with space, comma, plus, underscore and score delimiters    
    tags = tagContainer.split(/[\s,.+_-]+/);
    var cleanedTags = [];
    // Extracting tags from the name of the containing directory
    var tagsFromDirName = extractContainingDirectoryName(filePath).trim().split(/[\s,+_-]+/);
    for (var i = 0; i < tagsFromDirName.length; i++) {
      if (tagsFromDirName[i].trim().length > 1) {
        cleanedTags.push(tagsFromDirName[i]);
      }
    }
    // Cleaning the tags from filename        
    for (var j = 0; j < tags.length; j++) {
      if (tags[j].trim().length > 1) {
        cleanedTags.push(tags[j]);
      }
    }
    return cleanedTags;
  }

  // Internal
  function generateFileName(fileName, tags, tagMethod) {
    if ( ("2" === tagMethod) || ("1" === tagMethod) ) {
      return fileName;
    }
    var tagsString = '';
    // Creating the string will all the tags by more that 0 tags
    if (tags.length > 0) {
      tagsString = BEGIN_TAG_CONTAINER;
      for (var i = 0; i < tags.length; i++) {
        tagsString += tags[i] + TSCORE.Config.getTagDelimiter();
      }
      tagsString = tagsString.trim();
      tagsString += END_TAG_CONTAINER;
    }
    console.log('The tags string: ' + tagsString);
    var fileExt = extractFileExtension(fileName);
    console.log('Filename: ' + fileName + ' file extenstion: ' + fileExt);
    // Assembling the new filename with the tags    
    var newFileName = '';
    var beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
    var endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
    var lastDotPosition = fileName.lastIndexOf('.');
    if (beginTagContainer < 0 || endTagContainer < 0 || beginTagContainer >= endTagContainer) {
      // Filename does not contains tags.        
      if (lastDotPosition < 0) {
        // File does not have an extension
        newFileName = fileName + tagsString;
      } else {
        // File has an extension
        newFileName = fileName.substring(0, lastDotPosition) + TSCORE.Config.getPrefixTagContainer() + tagsString + '.' + fileExt;
      }
    } else {
      // File does not have an extension
      newFileName = fileName.substring(0, beginTagContainer) + tagsString + fileName.substring(endTagContainer + 1, fileName.length);
    }
    if (newFileName.length < 1) {
      throw 'Generated filename is invalid';
    }
    return newFileName;
  }

  // Internal
  function generateTagFileContents(tags){
    var tagsString = '';
    // Creating the string with all the tags by more than 0 tags
    if (tags.length > 0) {
      tagsString = BEGIN_TAG_CONTAINER;
      for (var i = 0; i < tags.length; i++) {
        tagsString += tags[i] + TSCORE.Config.getTagDelimiter();
      }
      tagsString = tagsString.trim();
      tagsString += END_TAG_CONTAINER;
    }
    console.log('The tags string: ' + tagsString);
    return tagsString;
  };

  function writeTagsToFile(filePath, tags, tagMethod, isConversion) {
    console.log('Add the tags to: ' + filePath);
    if (undefined !== filePath) {
      if (TSCORE.Config.getLocation(filePath) !== undefined) {
        // File is being copied/moved to another tagspaces directory.
        tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
      }
    }
    var noError = true;
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    // No tags for destination file as it was cleaned during conversion.
    var extractedTags = [];
    if (!isConversion)
      extractedTags = extractTags(filePath, tagMethod);

    for (var i = 0; i < tags.length; i++) {
      // check if tag is already in the tag array
      if (extractedTags.indexOf(tags[i].trim()) < 0) {
        // Adding the new tag
        extractedTags.push(tags[i].trim());
      }
    }

    if (tagMethod === "2") {
      var newTagFileContent = JSON.parse(JSON.stringify(tagDatabaseTemplate));
      newTagFileContent._id = filePath;
      newTagFileContent.tags = generateTagFileContents(extractedTags);
      TSCORE.IO.writeDatabase(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, newTagFileContent);

    } else if (tagMethod === "1") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.saveTextFile(filePath + TAG_FILE_EXTENSION, newTagFileContent, true, true);

    } else {
      var newFileName = generateFileName(fileName, extractedTags);
      noError = TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName, true, true);
    }
    if (!isConversion)
      collectRecentTags(tags);

    return noError;
  }

  function removeTagsFromFile(filePath, tags) {
    console.log('Remove the tags from: ' + filePath);
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var extractedTags = extractTags(filePath);
    for (var i = 0; i < tags.length; i++) {
      // check if tag is already in the tag array
      var tagLoc = extractedTags.indexOf(tags[i].trim());
      if (tagLoc >= 0) {
        // Remove the new tag
        extractedTags.splice(tagLoc, 1);
      }
    }
    if (TSCORE.Config.getLocation(filePath).tagMethod === "2") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.writeDatabase(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, newTagFileContent);

    } else if (TSCORE.Config.getLocation(filePath).tagMethod === "1") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.saveTextFile(filePath + TAG_FILE_EXTENSION, newTagFileContent, true, true);

    } else {
      var newFileName = generateFileName(fileName, extractedTags);
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
    }
  }

  function cleanFileFromTags(filePath, tagMethod) {
    console.log('Cleaning file from tags: ' + filePath);
    if (undefined === tagMethod) {
      tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
    }
    if (tagMethod === "2") {
      TSCORE.IO.clearDatabaseEntry(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, newTagFileContent);
      return filePath;

    } else if (tagMethod === "1") {
      TSCORE.IO.deleteElement(filePath + TAG_FILE_EXTENSION, true, true);
      return filePath;

    } else {
      var fileTitle = extractTitle(filePath, tagMethod);
      var fileExt = extractFileExtension(filePath);
      var containingDirectoryPath = extractContainingDirectoryPath(filePath);
      if (fileExt.length > 0) {
        fileExt = '.' + fileExt;
      }
      var newFilePath = containingDirectoryPath + TSCORE.dirSeparator + fileTitle + fileExt;
      try {
        TSCORE.IO.renameFile(filePath, newFilePath);
      } catch (error) {
        if ('ENOENT' !== error.code)
          throw error;
        else
          return newFilePath;
      }
      return newFilePath;
    }
  }

  function deleteElement(filePath, isPermanent) {
    if (undefined === filePath) {
      return false;
    }
    var tagMethod = TSCORE.Config.getLocation(filePath).tagMethod;
    if ("1" === tagMethod) {
      TSCORE.IO.deleteElement(filePath + TAG_FILE_EXTENSION, true, false);  // Now remove the file.
    }
    TSCORE.IO.deleteElement(filePath, true, false);  // Now remove the file.
    return true;
  }

  function cleanFilesFromTags(filePathArray) {
    console.log('Cleaning file from tags');
    var cleanedFileNames = [];
    for (var i = 0; i < filePathArray.length; i++) {
      cleanedFileNames.push(cleanFileFromTags(filePathArray[i]));
    }
    return cleanedFileNames;
  }

  function addTag(filePathArray, tagArray) {
    console.log('Adding tags to files');
    for (var i = 0; i < filePathArray.length; i++) {
      writeTagsToFile(filePathArray[i], tagArray);
    }
  }

  function removeTags(filePathArray, tagArray) {
      console.log('Remove tags from files');
      for (var i = 0; i < filePathArray.length; i++) {
        removeTagsFromFile(filePathArray[i], tagArray);
      }
    }
    // Moves the location of tag in the file name
    // possible directions should be next, prev, last, first
  function moveTagLocation(filePath, tagName, direction) {
    console.log('Moves the location of tag in the file name: ' + filePath);
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var extractedTags = extractTags(filePath);
    var tmpTag;
    for (var i = 0; i < extractedTags.length; i++) {
      // check if tag is already in the tag array
      if (extractedTags[i] === tagName) {
        if (direction === 'prev' && i > 0) {
          tmpTag = extractedTags[i - 1];
          extractedTags[i - 1] = extractedTags[i];
          extractedTags[i] = tmpTag;
          break;
        } else if (direction === 'next' && i < extractedTags.length - 1) {
          tmpTag = extractedTags[i];
          extractedTags[i] = extractedTags[i + 1];
          extractedTags[i + 1] = tmpTag;
          break;
        } else if (direction === 'first' && i > 0) {
          tmpTag = extractedTags[i];
          extractedTags[i] = extractedTags[0];
          extractedTags[0] = tmpTag;
          break;
        }
      }
    }
    if (TSCORE.Config.getLocation(filePath).tagMethod === "2") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.writeDatabase(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, newTagFileContent);

    } else if (TSCORE.Config.getLocation(filePath).tagMethod === "1") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.saveTextFile(filePath + TAG_FILE_EXTENSION, newTagFileContent, true, true);

    } else {
      var newFileName = generateFileName(fileName, extractedTags);
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
    }
  }

  // Replaces a tag with a new one
  function renameTag(filePath, oldTag, newTag) {
    console.log('Rename tag for file: ' + filePath);
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var extractedTags = extractTags(filePath);
    for (var i = 0; i < extractedTags.length; i++) {
      // check if tag is already in the tag array
      if (extractedTags[i] === oldTag) {
        extractedTags[i] = newTag.trim();
      }
    }

    if (TSCORE.Config.getLocation(filePath).tagMethod === "2") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.writeDatabase(TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME, newTagFileContent);

    } else if (TSCORE.Config.getLocation(filePath).tagMethod === "1") {
      var newTagFileContent = generateTagFileContents(extractedTags);
      TSCORE.IO.saveTextFile(filePath + TAG_FILE_EXTENSION, newTagFileContent, true, true);

    } else {
      var newFileName = generateFileName(fileName, extractedTags);
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
    }
  }

  function changeTitle(filePath, newTitle) {
    console.log('Changing title for file: ' + filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var extractedTags = extractTags(filePath);
    var fileExt = extractFileExtension(filePath);
    if (fileExt.length > 0) {
      fileExt = '.' + fileExt;
    }

    if (TSCORE.Config.getLocation(filePath).tagMethod === "2") {
      // Rename both the original and associated tag files.
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newTitle + fileExt);
      var databasePath = TSCORE.Config.getLocation(filePath).path + TAG_DATABASE_NAME,
        newId = containingDirectoryPath + TSCORE.dirSeparator + newTitle + fileExt;
      TSCORE.IO.changeDatabaseEntryId(databasePath, filePath, newId);

    } else if (TSCORE.Config.getLocation(filePath).tagMethod === "1") {
      // Rename both the original and associated tag files.
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newTitle + fileExt);
      TSCORE.IO.renameFile(filePath + TAG_FILE_EXTENSION, containingDirectoryPath + TSCORE.dirSeparator + newTitle + fileExt + TAG_FILE_EXTENSION);

    } else {
      // TODO generalize generateFileName to support fileTitle & fileExtension
      var newFileName = generateFileName(newTitle, extractedTags);
      TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName + fileExt);
    }
    return true;
  }

  // Removing a tag from a filename
  function removeTag(filePath, tagName) {
    console.log('Removing tag: ' + tagName + ' from ' + filePath);
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var tags = extractTags(filePath);
    var newTags = [];
    for (var i = 0; i < tags.length; i++) {
      if (tags[i] !== tagName) {
        newTags.push(tags[i]);
      }
    }
    if (TSCORE.Config.getLocation(filePath).tagMethod === "1") {
      var newTagFileContent = generateTagFileContents(newTags);
      TSCORE.IO.saveTextFile(filePath + TAG_FILE_EXTENSION, newTagFileContent, true, true);
    } else {
      var newFileName = generateFileName(fileName, newTags);
    TSCORE.IO.renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
    }
  }

  //Collect recent tags in a custom tag-group
  function collectRecentTags (newTags) {
    var collectGroupKey = 'COL';
    var collectGroup = TSCORE.Config.getTagGroupData(collectGroupKey);
    if (!collectGroup) {

      var collectGroupTemplate = {
        'title': $.i18n.t('ns.common:collectedTagsTagGroupTitle'),
        'key': collectGroupKey,
        'expanded': true,
        'children': []
      };

      TSCORE.Config.addTagGroup(collectGroupTemplate);
      TSCORE.Config.saveSettings();
      collectGroup = collectGroupTemplate;
    }

    newTags.forEach(function(newTagName) {
      if (!TSCORE.Config.findTag(newTagName)) {
        TSCORE.Config.createTag(collectGroup, newTagName);
        TSCORE.generateTagGroups();
      }
    });
  }

  // Public API definitions
  exports.beginTagContainer = BEGIN_TAG_CONTAINER;
  exports.endTagContainer = END_TAG_CONTAINER;
  exports.tagFileExtension = TAG_FILE_EXTENSION;
  exports.tagDatabaseName = TAG_DATABASE_NAME;
  exports.extractFileName = extractFileName;
  exports.extractFileNameWithoutExt = extractFileNameWithoutExt;
  exports.extractFileNameWithoutTags = extractFileNameWithoutTags;
  exports.extractContainingDirectoryPath = extractContainingDirectoryPath;
  exports.extractContainingDirectoryName = extractContainingDirectoryName;
  exports.extractDirectoryName = extractDirectoryName;
  exports.extractParentDirectoryPath = extractParentDirectoryPath;
  exports.extractFileExtension = extractFileExtension;
  exports.extractTitle = extractTitle;
  exports.formatFileSize = formatFileSize;
  exports.formatDateTime = formatDateTime;
  exports.formatDateTime4Tag = formatDateTime4Tag;
  exports.convertStringToDate = convertStringToDate;
  exports.convertTags = convertTags;
  exports.extractTags = extractTags;
  exports.suggestTags = suggestTags;
  exports.writeTagsToFile = writeTagsToFile;
  exports.copyFile = copyFile;
  exports.renameFile = renameFile;
  exports.deleteElement = deleteElement;
  exports.moveTagLocation = moveTagLocation;
  exports.renameTag = renameTag;
  exports.removeTag = removeTag;
  exports.removeTags = removeTags;
  exports.addTag = addTag;
  exports.cleanFilesFromTags = cleanFilesFromTags;
  exports.cleanTrailingDirSeparator = cleanTrailingDirSeparator;
  exports.changeTitle = changeTitle;
  exports.stringEndsWith = stringEndsWith;
});