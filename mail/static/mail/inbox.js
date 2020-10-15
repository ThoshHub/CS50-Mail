document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector(.email_border)

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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // the way this works is that it sets the emails view to a block and the compose view to none which hides it
  // TODO now all we have to do is grab emails using a function and then create html out of that data
  // and insert it into the page
  // !! 7:14 on UI lecture shows how to do a foreach loop
  // the emails we grab will be based on which 'mailbox' the user clicked, which is passed into this function
  // typing "get_emails(inbox)" in the JS console returns the two emails
  
  //console.log('Hello World 2');
  get_emails(mailbox);
}

function get_emails(mailbox){
	fetch('/emails/inbox')
	.then(response => response.json())
	.then(emails => {
		// Print emails
		console.log(emails);
		
		// ... do something else with emails ...
		// split the JSON and store subject, from, and timestamp into different variables
		
		emails.forEach(element => {
			create_email_listing(element)
		});

		
	});
}

function create_email_listing(element) {
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