var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	bodyParser = require('body-parser'),
	path = require('path'),
	mongoose = require('mongoose'),
	session = require('client-sessions');

mongoose.connect('mongodb://localhost/userdatabase',function(err){
	if(err){
		console.log(err);
	}else{
		console.log('Connected to userdatabase');
	}
});

var UserSchema = mongoose.Schema({
	Firstname: String,
	Lastname: String,
	Email: String,
	Password: String,
	Gender: String,
	Birthday: String
});

var User_model = mongoose.model('user_details',UserSchema);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/views'));
app.set('view engine','ejs');

app.use(session({
	cookieName: 'user_session',
	secret: 'p<U++Yp2>@=DVL[%:,>LhMz5e;@e)k"GE@6mJ)h+4xdA$9Ygp+;lc4IV.=de<A.',
	duration: 30*60*1000,
	activeDuration: 5*60*1000,
	httpOnly: true,
	secure: true,
	ephemeral: true
}));

app.get('/',function(req,res){
	res.render('index');
});

app.get('/signup',function(req,res){
	res.render('signup');
});

app.post('/signup_details',function(req,res){

	var ok_obj = [{state_name: 'details_ok'}];

	function logic_obj(state,cases){
		this.state_name = 'logic_array';
		this.state = state;
		this.case = cases;
	}

	var logic_array = new Array(2);


	for(i=0 ; i< logic_array.length ; i++){
		logic_array[i] = new logic_obj(true,'');
	}


	var FirstName = req.body.Firstname,
		Lastname = req.body.Lastname,
		Email = req.body.Email,
		Password = req.body.Password,
		RePassword = req.body.RePassword,
		Gender = req.body.Gender,
		Birthday = req.body.Birthday;

		//note! username == Email

		User_model.findOne({Email: Email},function(err,obj){
			if(err){
				console.log(err);
				return res.send(500);
			}else{

				if(obj==undefined){
					//no email found
					if(Password != RePassword){
						logic_array[1].state = false;
						return res.send(logic_array);
					}else{
						var new_user = new User_model();

						new_user.Firstname = FirstName;
						new_user.Lastname = Lastname;
						new_user.Email = Email;
						new_user.Password = Password;
						new_user.Gender = Gender;
						new_user.Birthday = Birthday;

						new_user.save(function(err,saved_object){
							if(err) throw err;
						});
					
						return res.send(ok_obj);
					}

				}else{
					//email found
					logic_array[0].state = false;
					return res.send(logic_array);
				}
			}
		});
			
});


app.get('/main',function(req,res){

	if(req.user_session && req.user_session.user) //check for session exists?
	{
		res.render('main',{Firstname: req.user_session.user.Firstname,
						   Lastname: req.user_session.user.Lastname,
						   Email: req.user_session.user.Email,
						   Gender: req.user_session.user.Gender,
						   Birthday: req.user_session.Birthday});
	}else{
		//session not exist.
		res.redirect('/');
	}

});


app.post('/userdetails',function(req,res){

	var username = req.body.username;
	var password = req.body.password;
	var response_obj = {state: 'null' , url: 'null'};

	User_model.findOne({Email: username , Password: password},function(err,obj){
		if(err) throw err;

		if(obj != undefined){
			//user data found.
			req.user_session.user = obj; //save user object into session
			response_obj.state = 'true';
			response_obj.url = '/main';	
			res.send(response_obj);
		}else{
			//user detail not found.
			response_obj.state = 'false';
			res.send(response_obj);
		}
	});

});


app.all('*',function(req,res){
	res.redirect('/');
});


server.listen(3000);
console.log('Server started at port 3000');