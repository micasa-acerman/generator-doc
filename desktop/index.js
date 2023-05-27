const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const PizZip = require("pizzip");
const path = require('path');
const { parse } = require('csv-parse');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
let mainWindow;
try {
  require('electron-reloader')(module)
} catch (_) { }
function createWindow() {
  if(!fs.existsSync(path.join(__dirname, 'template.docx'))){
    dialog.showErrorBox("Ошибка", "Не найден файл template.docx")
    app.exit();
  }  
  if(!fs.existsSync(path.join(__dirname, 'data.csv'))){
    dialog.showErrorBox("Ошибка", "Не найден файл data.csv")
    app.exit();
  }
  if(new Date().getTime() > 1685232000000){
    dialog.showErrorBox("Триал версия завершена", "Обратитесь к создателю")
    app.exit();
  }


  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    maximizable: true,
    autoHideMenuBar: true,
    title: 'Вектор 13',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('ready-to-show', () => {
    let csvData = [];
    fs.createReadStream(path.join(__dirname, 'data.csv'))
      .pipe(parse({ delimiter: ';' }))
      .on('data', function (csvrow) {
        csvData.push(csvrow);
      })
      .on('end', function () {
        mainWindow.webContents.send('form-load', csvData)
      });
  })
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
if (require('electron-squirrel-startup')) app.quit();
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('generate', (event, formData) => {
  try {
    dialog.showSaveDialog(mainWindow, {
      title: 'Сохранить форму',
      defaultPath: path.join(app.getPath('documents'), 'Документ.docx'),
      filters: [{ name: 'Word файлы', extensions: ['docx'] }]
    }).then(result => {
      if (!result.canceled) {
        saveDataToDoc(result.filePath, formData)
      }
    }).catch(e => mainWindow.webContents.send('error', e.message));
  } catch (e) {
    mainWindow.webContents.send('error', e.message)
  }
});



function saveDataToDoc(outputPath = "C:\\template.docx", data) {
  const content = fs.readFileSync(path.resolve(__dirname, "template.docx"), 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);

  doc.setData(data);
  doc.render();

  const output = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, output);
}