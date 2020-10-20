document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

//   // USE THIS FOR REPLY // OR DON'T
//   document.addEventListener('click', event => {
// 	  const element = event.target;
// 	  console.log("Something was clicked")
// 	  // 45:36 for an on click event
//   })

  // Send an email
  document.querySelector('#compose-form').onsubmit = () => {
	const recipients = document.querySelector('#compose-recipients').value;
	const subject = document.querySelector('#compose-subject').value;
	const body = document.querySelector('#compose-body').value;
	send_email(recipients, subject, body)
	load_mailbox('sent')
	console.log("Sending Email:\nRecipients: " + recipients + "\nSubject: \t" + subject + "\nBody: \t\t" + body)
	
	// TODO the mailbox needs to go the sent after, but atm it redirects to inbox
	
	// Stop form from submitting
	return false;
	}
});

function send_email(recipients, subject, body){
	fetch('/emails', {
		method: 'POST',
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body
		})
	  })
	  .then(response => response.json())
	  .then(result => {
		  // Print result
		  console.log(result);
	  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-message').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// This function loads the mailbox and then calls the get_emails to get the content of the mailbox
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-message').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // requests the emails of the mailbox
  get_emails(mailbox);
  // TODO edit this to filter it based on the mailbox!
  // in the get_emails() function, you need to filter out elements based on if they are (archived, sent, etc) depending on the mailbox "variable" that is passed in
}

// requests the emails of the mailbox
// for each email recieved, will call create_email_listing on it to generate an email on the page
function get_emails(mailbox){
	fetch('/emails/' + mailbox)
	.then(response => response.json())
	.then(emails => {
		// Print emails
		console.log(emails);
		
		// ... do something else with emails ...
		emails.forEach(element => {
			console.log(mailbox)
			create_email_listing(element, mailbox) // Mailbox is passed in because the individual email view depends on what mailbox the mail is from in display_email()
		});
	});
}

function create_email_listing(element, mailbox) {
	// Get details of the email
	const from = element.sender;
	const subject = element.subject;
	const timestamp = element.timestamp;
	const read = element.read;
	const id = element.id;
	var background = "#FFFFFF" // default background color is white
	if(read == true) {
		var background = "#D3D3D3" // if the email has been read, set it to grey
	}

	// Create a new div for the email
	const post = document.createElement('div')
	post.id = "email_" + element.id // give each email a new id

	const html_str = "<h4>Subject: " + subject + "</h4>" + "From:\t" + from + "<br>Time:\t" + timestamp
	post.innerHTML = `${html_str}`
	document.querySelector('#emails-view').append(post);

	// Set styles
	document.getElementById(post.id).style.border = "2px solid dodgerblue";
	document.getElementById(post.id).style.borderRadius = "15px";
	document.getElementById(post.id).style.padding = "10px"
	document.getElementById(post.id).style.marginBottom = "10px"
	document.getElementById(post.id).style.background = background

	// TODO make onclick that collapses everything and adds new html section to display contents of email
	// You CANNOT redirect to a new url because currently the view for index, login and register return an html page
	// so this HAS to be done on the index page
	post.onclick = function() {
		// Log what post was clicked
		// console.log("Post ID " + id + " Clicked!");

		// Call the function to Display the Email
		display_email(id, mailbox) // Mailbox is passed in because the individual email view depends on what mailbox the mail is from in display_email()
	};
}

function mark_email_read(email_id){
	// Set the email as read
	fetch('/emails/' + email_id, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	})
	console.log("Marked Email " + email_id + " As Read")
}
// This function hides everything else on the screen and displays the contents of a single email
function display_email(email_id, mailbox){
	// Log that this function was clicked
	console.log("Getting The Email For: " + email_id)

	// Mark the email as read
	mark_email_read(email_id)

	// Make a fetch request to get the email log it
	fetch('/emails/' + email_id)
	.then(response => response.json())
	.then(email => {
		// Print email
		console.log(email);

		// Show the email message and hide other views
		document.querySelector('#emails-view').style.display = 'none';
		document.querySelector('#compose-view').style.display = 'none';
		document.querySelector('#email-message').style.display = 'block';

		// Grab the email-message div and store it in a variable
		var email_body = document.querySelector("#email-message"); 

		// Get the sender, subject, and time that email was sent
		const from = email.sender;
		const subject = email.subject;
		const timestamp = email.timestamp;
		const message = email.body;

		// Loop through all recipients (is an array), create a string from it and then add it to the display
		var recipients = "";
		email.recipients.forEach(element => {
			recipients = recipients + " " + element;
		});
		recipients.replace(/[ ]+/g, ", "); // Replace all spaces with a comma and a space for readability

		// Set the inner div of email-message to the contents of the email that has been returned
		var current_email_message = "<h4>Subject: " + subject + "</h4>";
		current_email_message = current_email_message + "<h6>From: <span id=\"from_line\">" + from + "</span></h6>";
		current_email_message = current_email_message + "<h6>To: <span id=\"to_line\">" + recipients + "</span></h6>";
		current_email_message = current_email_message + "<h6 id=\"time_line\">Time: " + timestamp + "</h6>";
		current_email_message = current_email_message + "<h6>Message: " + "</h6>";
		current_email_message = current_email_message + "<p>" + message + "</p>";
		// current_email_message = current_email_message + "<button id=\"reply_button\" class=\"btn btn-primary\">Reply</button>" // Vestigial code
		email_body.innerHTML = `${current_email_message}`; // set inner html
		
		// TODO create an archive button like you created a reply button.
		// Then create an event listener for it 
		// should send post request and then dissappear
		// Then create an unarchive button like you created a reply button.
		// Then create an event listener for it
		// Finally put both buttons inside if statements, archive for mailbox and unarchive for archive
		// should send post request and then dissappear

		if(mailbox == "archive"){
			// Create an unarchive button
			var unarchive_button = document.createElement("button"); // create
			unarchive_button.innerHTML = "Unarchive"; //set label
			unarchive_button.className = "btn btn-danger"; // for bootstrap CSS
			unarchive_button.id = "unarchive_button"
			
			// Append the button
			email_body.appendChild(unarchive_button); // append the button

			// Create an event listener for the reply button
			unarchive_button.addEventListener ("click", function() {
				// console.log("You clicked the unarchive button!"); // for debugging
				
				// Unarchive the email via fetch
				fetch('/emails/' + email_id, {
					method: 'PUT',
					body: JSON.stringify({
						archived: false
					})
				  })

				// Remove the archive button
				unarchive_button.remove();

				// Display user feedback that the email has been Unarchived
				var unarchive_message = document.createElement('p');
				unarchive_message.innerHTML = "This email has been unarchived!";
				unarchive_message.className = "badge badge-secondary";
				email_body.appendChild(unarchive_message);
			});
		}

		if(mailbox == "inbox"){
			// Create a reply button
			var reply_button = document.createElement("button"); // create
			reply_button.innerHTML = "Reply"; // set label
			reply_button.className = "btn btn-primary"; // for bootstrap CSS
			reply_button.id = "reply_button"; // give it an id in case I want to do something with it in the future
		
			// Append the button
			email_body.appendChild(reply_button); // append the button
			
			// Create an event listener for the reply button
			reply_button.addEventListener ("click", function() {
				// console.log("You clicked the reply button!"); // for debugging
				compose_reply_email(from, subject, message, timestamp)
			});

			// Create an archive button
			var archive_button = document.createElement("button"); // create
			archive_button.innerHTML = "Archive"; // set label
			archive_button.className = "btn btn-danger"; // for bootstrap CSS
			archive_button.id = "archive_button"; // give it an id in case I want to do something with it in the future

			// Append the button
			// email_body.appendChild(document.createElement("br"));
			email_body.appendChild(archive_button); // append the buttons

			// Create an event listener for the archive button
			archive_button.addEventListener ("click", function() {
				// console.log("You clicked the archive button!"); // for debugging
				
				// Archive the email via fetch
				fetch('/emails/' + email_id, {
					method: 'PUT',
					body: JSON.stringify({
						archived: true
					})
				  })

				// Remove the archive button
				archive_button.remove();

				// Display user feedback that the email has been Archived
				var archive_message = document.createElement('p');
				archive_message.innerHTML = "This email has been archived!";
				archive_message.className = "badge badge-secondary";
				email_body.appendChild(archive_message);
			});
		}
	});
}

function compose_reply_email(from, subject, message, timestamp) {

	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';
	document.querySelector('#email-message').style.display = 'none';
  
	// Add "re:" in front of subject if it doesn't belong with Re:
	var reply_subject = ""
	if(subject.startsWith("Re: ")){
		reply_subject = subject;
	} else {
		reply_subject = "Re: " + subject
	}
	
	// Create previous message
	const reply_body = "\n\nOn " + timestamp + " " + from + " wrote: \n" + message

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = from;
	document.querySelector('#compose-subject').value = reply_subject;
	document.querySelector('#compose-body').value = reply_body;
  }

// old create_email_listing method 
function create_email_listing_201014091135(element) {
	const from = element.sender;
	const subject = element.subject;
	const timestamp = element.timestamp;
	const read = element.read;
	console.log("from: " + from + " subject: " + subject + " timestamp: " + timestamp);

	var email_listing = "<h4>Subject: " + subject + "</h4>" + "From:\t" + from + "<br>Time:\t" + timestamp
	var background = "#FFFFFF" // default background color is white
	if(read == true) {
		var background = "#D3D3D3" // if the email has been read, set it to grey
	}
	const div_email_class = "class=\"email_border\" style=\"background: " + background + ";\"" 
	email_listing = "<div " + div_email_class + ">" + email_listing + "</div>"
	var emails_list = document.getElementById("emails-view");
	emails_list.innerHTML = emails_list.innerHTML + `${email_listing}`; 
	// Need to use escape characters or intermediate variables to generate the text for this
	// Also need to add subdivs and borders to be able to change background color (if read or not) 
	// Also need some sort of JS to make an email marked read... there might be a post request in the  Django code, look there first also check the mails page documentation, there will probabably be a way to set mails as read...

	//document.querySelector('#emails-view').innerHTML = <h3>${"from: " + from + " subject: " + subject + " timestamp: " + timestamp}</h3>
}