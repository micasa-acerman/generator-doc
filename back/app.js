const express = require('express')
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const PizZip = require("pizzip");
const path = require('path');
const { parse } = require('csv-parse');
const app = express()
const {v4 } = require('uuid');
const morgan = require('morgan');

const port = 80
let csvData = [];

fs.createReadStream(path.join(__dirname, 'data.csv'))
  .pipe(parse({ delimiter: ';' }))
  .on('data', function (csvrow) {
    csvData.push(csvrow);
  })
  .on('end', function () {
    console.log('CSV data loaded');
  });

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'});
app.use(morgan('combined', { stream: logFile }));

app.get('/organizations', (req, res) => {
  res.json(csvData)
})


app.post('/generate', (req, res)=>{
  console.log(req.body)
  try{
    const filePath = path.join(__dirname,'docs',v4()+'.docx')
    saveDataToDoc(filePath,req.body)
    res.sendFile(
      filePath,
      function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Sent:', filePath);
            fs.unlinkSync(filePath)
        }
      }
    )
  }catch(e) {
    res.statusCode = 500
    res.send(e)
    console.error(e)
  }
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

app.use(express.static('public'));

function saveDataToDoc(filePath, data) {
  const content = fs.readFileSync(path.resolve(__dirname, "template.docx"), 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);

  doc.setData(data);
  doc.render();

  const output = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, output);
}