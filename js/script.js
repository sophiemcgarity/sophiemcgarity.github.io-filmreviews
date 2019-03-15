hamburger = document.getElementById('hamburger');
menu = document.getElementById('menu');

const toggleMenu = () => {
  menu.classList.toggle('showMenu');
  hamburger.classList.toggle('change');
}

hamburger.addEventListener('click', toggleMenu);

for (i = 0; i < menu.children.length; i++){
  menu.children[i].addEventListener('click',toggleMenu);
}

//pouchdb

let db = new PouchDB('reviews');
//global variable whether editing or not
let editMode = false;
//called function to update database on load

updateReviewsList();

//event listener added to modify button
document.getElementById('modifyReviewButton').addEventListener('click', modifyReview);

function modifyReview(evt){
  //prevent default page refresh on submit
  evt.preventDefault();
  //check if in edit modifyReview
  if(editMode){
    //check if edit mode =true, get review from database ensuring correct rev value is pulled too for when its saved later
    //the form id = "id", type set to hidden, fills the form with the pulled data and stores the records id here, used of hidden is a way of doing this
      db.get(document.getElementById('id').value).then(function(thisReview){
        thisReview.title = document.getElementById('title').value;
        thisReview.synopsis = document.getElementById('synopsis').value;
        thisReview.review = document.getElementById('review').value;
        thisReview.date = document.getElementById('date').value;
        thisReview.moviePoster = document.getElementById('moviePoster').value;
        thisReview.trailer = document.getElementById('trailer').value;

      db.put(thisReview).then(function(){
        //when update is complete the form is reset
        switchEditMode(false);
        updateReviewsList();
        clearForm();
      })
    })
  } else {
    //if edit mode is false a review is being added
    //a new id is created as a sequential numerical id, but needs to be stored as a string
    //all the documents in the database are retrieved
    db.allDocs().then(function(docs){
      //default id =0, will be 0 if no records exist already
      let newID = '0';
      //if existing records
      if(docs.rows.length > 0){
        //get the last id, convert to an interger to add 1 to it
        let highestID = parseInt(docs.rows[docs.rows.length-1].id);
        //used to set the value of the new id and covert back to a string for the database
        newID = (highestID + 1).toString();
      }
      //put object together
      let newReview = {
        _id: newID,
        title: document.getElementById('title').value,
        synopsis: document.getElementById('synopsis').value,
        review: document.getElementById('review').value,
        date: document.getElementById('date').value,
        moviePoster: document.getElementById('moviePoster').value,
        trailer: document.getElementById('trailer').value
      }
      //save the review
      db.put(newReview).then(function(){
        //clear form and update list
        clearForm();
        updateReviewsList();
      })
    });
  }
}

function updateReviewsList(){
  //sort reviews newest and oldest post
  let radios = document.getElementsByName("sort");
  radios[0].addEventListener("change", updateReviewsList);
  radios[1].addEventListener("change", updateReviewsList);
    //pull all records from database, {include_docs: true} ensures full version of record, normally would get the id and rev value
  db.allDocs({include_docs: true,descending: radios[0].checked}).then(function(reviews){
    //build string of html to insert intop the DOM, start with an empy toString
    let listContents = '';
    //loop through each row from the database
    for(let i = 0; i < reviews.total_rows; i++){
      //pull data at position i, then goes into doc property to get the full record
      let thisReview = reviews.rows[i].doc;
      //create string for the edit and delete buttons separately
      //each button has an onclick event handler that takes the id of the particular review as an argument
      let editButton = '<button onclick="editReview(\'' + thisReview._id + '\')">Edit</button>';
      let deleteButton = '<button onclick="deleteReview(\'' + thisReview._id + '\')">Delete</button>';
      let image = '<img class="reviewImage" src="' + thisReview.image + '">'
      //change date to human readable
      let release = new Date(thisReview.date);

      listContents += '<div class="homeContent"><div class="content"><div class"text><div class="summary"><img class="moviePoster" src="' + thisReview.moviePoster + '"/><details><summary>' + thisReview.title + '</summary><p>' + thisReview.synopsis + '</p><h3>Review</h3><p>' + thisReview.review + '</p><div><h3>Release date</h3><p>'+ release.toDateString() +'</p></div><div id="vidSize"> <iframe frameBorder="0" class="trailer" src="' + thisReview.trailer + '"></iframe></div>' + '<div class="buttons" id="editButton">' + editButton + '</div><div class="buttons" id="deleteButton">' + deleteButton + '</div></details><div class="underline"></div></div></div></div></div>';
    }
    //loop complete with string of HTML containing a table row for each item, now insert this into the table body
    document.getElementById('reviewsList').innerHTML = listContents;
  })
}

//called when edit button is clicked
function editReview(id) {

  //pull data from databse and fill in form with current values
  db.get(id).then(function(reviews){
    //run switchEditMode function first, then fill in the form, acual ediing occurs when the user hits the edit button on the form
    switchEditMode(true);
    document.getElementById('id').value = reviews._id;
    document.getElementById('title').value = reviews.title;
    document.getElementById('synopsis').value = reviews.synopsis;
    document.getElementById('review').value = reviews.review;
    document.getElementById('date').value = reviews.date;
    document.getElementById('moviePoster').value = reviews.moviePoster;
    document.getElementById('trailer').value = reviews.trailer;
  })
}

//function runs when user clicks delete button on list
function deleteReview(id) {
  //confirm alert to the user, with cancel and ok button
  //if ok returns true
  const conf = confirm('Are you sure you want to delete this film?');
  if(conf){
    //if ok, get full record for film
    db.get(id).then(function(thisReview){
      //tell database to remove it, db.remove() returns a promise, by returning the promise from the function we can used .then() on the end, rather than nest it here
      return db.remove(thisReview);
    }).then(function(){
      //record been removed,update review list
      updateReviewsList();
    })
  }
}

//function running in several places is combined here

function switchEditMode(newEditMode){
  if(newEditMode){
    //if swtiching to edit mode the global variable editMode is updated, and change the form title and button label
    editMode = true;
    document.getElementById('formTitle').innerHTML = 'Edit a Review';
    document.getElementById('modifyReviewButton').innerHTML = 'Edit Review';
  } else {
    //if switching out of edit mode
    editMode = false;
    document.getElementById('formTitle').innerHTML = 'Add a Review';
    document.getElementById('modifyReviewButton').innerHTML = 'Add Review';
  }
}

function clearForm(){
  document.getElementById('id').value = '';
  document.getElementById('title').value = '';
  document.getElementById('synopsis').value = '';
  document.getElementById('review').value = '';
  document.getElementById('date').value = '';
  document.getElementById('moviePoster').value = '';
  document.getElementById('trailer').value = '';
}
