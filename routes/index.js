var express = require('express');
var router = express.Router();
var fs = require('fs')
var csv = require('csv-parser')
var csvWriter = require('csv-write-stream');

const authors = [];
const magazines = [];
const books = [];

fs.createReadStream('authors.csv')
  .pipe(csv())
  .on('data', function (row) {    
    const author = {
        emaail: row.email,
        firstname: row.firstname,
        lastname: row.lastname,
    }
    authors.push(author)
  })
  .on('end', function () {
      console.table(authors)
})

fs.createReadStream('books.csv')
  .pipe(csv())
  .on('data', function (row) {    
    const book = {
        title: row.title,
        isbn: row.isbn,
        authors: row.authors,
        description: row.description
    }
    books.push(book)
  })
  .on('end', function () {
      console.table(books)
})

fs.createReadStream('magazines.csv')
  .pipe(csv())
  .on('data', function (row) {    
    const magazine = {
        title: row.title,
        isbn: row.isbn,
        authors: row.authors,
        publishedAt: row.publishedAt
    }
    magazines.push(magazine)
  })
  .on('end', function () {
      console.table(magazines)
})


router.get('/', function(req, res, next) {
  res.render('index', {'authors': authors, 'books': books, 'magazines': magazines});
});

router.post('/isbn', function(req, res, next){
  var isbn = req.body.isbn; 
  var result = [];

  for(var i=0; i<books.length; i++){
    if(books[i].isbn == isbn) result.push(books[i]);
  }
  for(var i=0; i<magazines.length; i++){
    if(magazines[i].isbn == isbn) result.push(magazines[i]);
  }
  res.render('disp', {res: result});
});

router.post('/author', function(req, res, next){
  var author = req.body.author; 
  var result = [];

  for(var i=0; i<books.length; i++){
    for(var j=0; j<books[i].authors.length; j++)
      if(books[i].authors[j] == author) result.push(books[i]);
  }
  for(var i=0; i<magazines.length; i++){
    for(var j=0; j<magazines[i].authors.length; j++)
      if(magazines[i].authors[j] == author) result.push(magazines[i]);
  }
  res.render('disp', {res: result});
});

router.post('/book', function(req, res, next){
  const book = {
    title: req.body.title,
    isbn: req.body.isbn,
    authors: req.body.authors,
    description: req.body.description
  };
  var writer = csvWriter({sendHeaders: false});
  writer.pipe(fs.createWriteStream('books.csv', {flags: 'a'}));
  writer.write({
    book
  });
  writer.end();
});

router.post('/magazine', function(req, res, next){
  const magazine = {
    title: req.body.title,
    isbn: req.body.isbn,
    authors: req.body.authors,
    publishedAt: req.body.publishedAt
  };
  var writer = csvWriter({sendHeaders: false});
  writer.pipe(fs.createWriteStream('magazines.csv', {flags: 'a'}));
  writer.write({
    magazine
  });
  writer.end();
})

module.exports = router;
