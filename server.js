const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const PORT = process.env.PORT || 3001;
const app = express();

const fetchNotes = () => {
  return readFile('db/db.json', 'utf-8')
  .then(rawNotes => [].concat(JSON.parse(rawNotes)))
}

app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);



app.get('/api/notes', (req, res) => {
    fetchNotes().then(notes => res.json(notes))
    .catch(err => res.status(500).json(err))
    });
    
app.post('/api/notes', ({body}, res) => {
    fetchNotes()
    .then(savedNotes => {
    const newNotes = [...savedNotes, {title: body.title, text: body.text, id: uuidv4()}]
    writeFile('db/db.json', JSON.stringify(newNotes)).then(() => res.json({msg: 'ok'}))
    .catch(err => res.status(500).json(err))
    })
})
app.delete('/api/notes/:id', (req, res) => {
    fetchNotes().then(savedNotes => {
      let newNotes = savedNotes
      .filter(note => note.id !== req.params.id)
      writeFile('db/db.json', JSON.stringify(newNotes))
      .then(() => res.json({msg: 'ok'}))
      .catch(err => res.status(500).json(err))
    })
  })

app.listen(PORT, () => console.log(`App listening on port: ${PORT}.`));