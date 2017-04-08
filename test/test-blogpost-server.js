const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {Blogpost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedBlogpostData() {
  console.info('seeding Blog data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogpostData());
  }
  // this will return a promise
  return Blogpost.insertMany(seedData);
}

// used to generate data to put in db
function generateBlogTitle() {
  const titles = [
    'Blah One', 'Blah Two', 'The Blah', 'The Blah Blah', 'The Super Blah'];
  return titles[Math.floor(Math.random() * titles.length)];
}

// used to generate data to put in db
function generateContent() {
  const theContent = ['Yup Yup Yup Yup Yup Yup', 'In Space, no one can hear you scream',
    'Ambition is always the shadow of dreams'];
  return theContent[Math.floor(Math.random() * theContent.length)];
}

// used to generate data to put in db
function generateFirstName() {
  const first_Name = ['Russ', 'Darth', 'Luke', 'R2', 'James'];
  return first_Name[Math.floor(Math.random() * first_Name.length)];
}

function generateLastName() {
  const last_Name = ['Sabs', 'Vader', 'Skywalker', 'D2', 'Kirk'];
  return last_Name[Math.floor(Math.random() * last_Name.length)];
}

function generateBlogpostData() {
  return {
    title: generateBlogTitle(),
    content: generateContent(),
    author: {
      firstName: generateFirstName(),
      lastName: generateLastName()
    }
  }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blogpost API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogpostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('GET endpoint', function() {

    it('should return all existing blogpostings', function() {
     
      let res;
      return chai.request(app)
        .get('/blogpost')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.blogpost.should.have.length.of.at.least(1);
          return Blogpost.count();
        })
        .then(function(count) {
          res.body.blogpost.should.have.length.of(count);
        });
    });

    it('should return blogpost with right fields', function() {

      let resBlogpost;
      return chai.request(app)
        .get('/blogpost')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.blogpost.should.be.a('array');
          res.body.blogpost.should.have.length.of.at.least(1);

          res.body.blogpost.forEach(function(blogpost) {
            blogpost.should.be.a('object');
            blogpost.should.include.keys(
              'id', 'title', 'content', 'author');
          });
          resBlogpost = res.body.blogpost[0];
          return Blogpost.findById(resBlogpost.id);
        })
        .then(function(blogpost) {

          resBlogpost.id.should.equal(blogpost.id);
          resBlogpost.title.should.equal(blogpost.title);
          resBlogpost.content.should.equal(blogpost.content);
          resBlogpost.author.should.contain(blogpost.author.firstName);
          resBlogpost.author.should.contain(blogpost.author.lastName);
        });
    });
  });

  describe('POST endpoint', function() {
   
    it('should add a new blog posting', function() {

      const newBlogpost = generateBlogpostData();

      return chai.request(app)
        .post('/blogpost')
        .send(newBlogpost)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'author');
          res.body.title.should.equal(newBlogpost.title);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.content.should.equal(newBlogpost.content);
          res.body.author.should.contain(newBlogpost.author.firstName);
          res.body.author.should.contain(newBlogpost.author.lastName);
          return Blogpost.findById(res.body.id);
        })
        .then(function(blogpost) {
          blogpost.title.should.equal(newBlogpost.title);
          blogpost.content.should.equal(newBlogpost.content);
          blogpost.author.firstName.should.equal(newBlogpost.author.firstName); 
          blogpost.author.lastName.should.equal(newBlogpost.author.lastName); 
        });
    });
  });
  //###########################################################

  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        title: 'good day',
        content: 'skipidy do dah, skipidy day'
      };

      return Blogpost
        .findOne()
        .exec()
        .then(function(blogpost) {
          updateData.id = blogpost.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/blogpost/${blogpost.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);

          return Blogpost.findById(updateData.id).exec();
        })
        .then(function(blogpost) {
          blogpost.title.should.equal(updateData.title);
          blogpost.content.should.equal(updateData.content);
        });
      });
  });

  describe('DELETE endpoint', function() {
    
    it('delete a blogpost by id', function() {

      let blogpost;

      return Blogpost
        .findOne()
        .exec()
        .then(function(_blogpost) {
          blogpost = _blogpost;
          return chai.request(app).delete(`/blogpost/${blogpost.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Blogpost.findById(blogpost.id).exec();
        })
        .then(function(_blogpost) {
          
          should.not.exist(_blogpost);
        });
    });
  });
});
