// Google Apps Script code
const SHEET_ID = 'YOUR_SHEET_ID';
const SHEET_NAME = 'Exercises';

function doGet(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'getExercises':
      return getExercises();
    default:
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Invalid action'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  switch(action) {
    case 'addExercise':
      return addExercise(data.exercise);
    case 'updateExercise':
      return updateExercise(data.id, data.updates);
    case 'deleteExercise':
      return deleteExercise(data.id);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Invalid action'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getExercises() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const exercises = data.slice(1).map(row => {
    const exercise = {};
    headers.forEach((header, index) => {
      exercise[header] = row[index];
    });
    return exercise;
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    exercises
  })).setMimeType(ContentService.MimeType.JSON);
}

function addExercise(exercise) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = headers.map(header => exercise[header] || '');
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Exercise added successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateExercise(id, updates) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'ID column not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const rowIndex = data.findIndex((row, index) => index > 0 && row[idIndex] === id);
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Exercise not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  headers.forEach((header, colIndex) => {
    if (updates.hasOwnProperty(header)) {
      sheet.getRange(rowIndex + 1, colIndex + 1).setValue(updates[header]);
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Exercise updated successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function deleteExercise(id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'ID column not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const rowIndex = data.findIndex((row, index) => index > 0 && row[idIndex] === id);
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Exercise not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  sheet.deleteRow(rowIndex + 1);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Exercise deleted successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}
