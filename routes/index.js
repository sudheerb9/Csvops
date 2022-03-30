var express = require('express');
var router = express.Router();
var fs = require('fs')
var csv = require('csv-parser')
var csvWriter = require('csv-write-stream');
const stripBomStream = require('strip-bom-stream');
require('body-parser');

const authors = [];
const magazines = [];
const books = [];

fs.createReadStream('public/authors.csv').pipe(stripBomStream())
  .pipe(csv({ separator: ';' }))
  .on('data', function (row) {    
    const author = {
        email: row.email,
        firstname: row.firstname,
        lastname: row.lastname,
    }
    authors.push(author)
  })
  .on('end', function () {
      console.table(authors)
})

fs.createReadStream('public/books.csv').pipe(stripBomStream())
  .pipe(csv({ separator: ';' }))
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

fs.createReadStream('public/magazines.csv').pipe(stripBomStream())
  .pipe(csv({ separator: ';' }))
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
  res.send({'books': books, 'magazines': magazines});
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
  res.send({res: result});
});

router.post('/author', function(req, res, next){
  var author = req.body.author; 
  var result = [];
  
  for(var i=0; i<books.length; i++){
    var arr = books[i].authors.split(',');
    for(var j=0; j<arr.length; j++)
      if(arr[j] == author) result.push(books[i]);
  }
  for(var i=0; i<magazines.length; i++){
    var arr = magazines[i].authors.split(',');
    for(var j=0; j<arr.length; j++)
      if(arr[j] == author) result.push(magazines[i]);
  }
  res.send({res: result});
});

router.post('/book', function(req, res, next){
  var writer = csvWriter({separator: ';' , sendHeaders: false});
  writer.pipe(fs.createWriteStream('public/books.csv', {flags: 'a'}));
  writer.write({
    title:req.body.title,
    isbn:req.body.isbn,
    authors:req.body.authors,
    description:req.body.description
  });
  writer.end();
  res.sendStatus(200);
});

router.post('/magazine', function(req, res, next){
  var writer = csvWriter({separator: ';' , sendHeaders: false});
  writer.pipe(fs.createWriteStream('public/magazines.csv', {flags: 'a'}));
  writer.write({
    title:req.body.title,
    isbn:req.body.isbn,
    authors:req.body.authors,
    publishedAt:req.body.publishedAt
  });
  writer.end();
  res.sendStatus(200);
})

router.get('/sorted', function(req, res, next){
  let result = books.concat(magazines);
  result.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
  res.send({res: result});
})

module.exports = router;
