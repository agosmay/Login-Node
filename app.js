//invocamos express
const express =require('express')
const app = express()



//seteamos urlencoded para capturar datos del formulario
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

//invocamos a dotenv
const dotenv = require('dotenv')
dotenv.config({path:'./.env'})// si o si incluir el path para q encuentre las variables de entorno, m falto esto la otra vez, imposible q lo encuentre

//directorio public
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))//me facilita porq ya me pone estando en la carpeta public

//establecemos motor de plantillas
//PRODFUNDIZAR MAS EN 
//app.set('views', './views') // specify the views directory
const hbs= require('hbs')
app.set('view engine', 'hbs')

//invocamos a bcryptjs
const bcrypt= require('bcrypt')

//invocamos a express-session y su configuracion
const session = require('express-session')
app.use(session({
  secret: 'keyboard cat',//se puede crear un random c js con clave aleatoria
  resave: false,
  saveUninitialized: false,
  cookie : { maxAge : 300000 }
  
}))

//importamos base de datos invocamos el modulo de conexion a la base de datos
const db = require('./db')

//estableciendo las rutas

app.get('/visitas', (req,res)=>  {
	//req.session.visitas = req.session.visitas ? ++req.session.visitas : 1
	 if (req.session.views) {
    req.session.views++
	res.render('visitas', {
		titulo :'visitas',
		vistas : req.session.views
		
	})
    
  } else {
    req.session.views = 1
	res.render('visitas', {
		titulo : 'visitas', 
		vistas: req.session.views
		})
		
	}
    
 
  
  })


app.get('/', (req, res)=> {


	if(req.session.logueado){
		
	res.render('index', {
		titulo : 'Inicio',
		logueado : req.session.logueado,
		user : req.session.user,
		vistas : req.session.views
		
	
		
	})
	}else {
		
		res.render('index', {
			titulo:'inicio',
			
		})
	}
	
})

app.get('/login', (req,res)=> {
	res.render('login', {
		
		titulo: 'Login'
	})
	
})

app.get('/register', (req,res)=>{
	
	res.render('register', {
		
		titulo : 'Register'
	})
	
})

//rutas post

app.post('/register', (req,res)=> {
let user = req.body.user
	
	let sql = "SELECT * FROM users WHERE user =?"
	if(user) {
		db.query(sql, [user], (err,data)=> {
			if(err) throw err;
			if(data.length>0) {
				res.render('register', {
					titulo : 'register',
					error : 'Usuario ya registrado, por favor cree otro'
					
					
				})
			}else {
				let cuerpo= req.body
	const saltRounds = 10;
	let sql="INSERT INTO users SET ?"
	bcrypt.hash(cuerpo.pass, saltRounds, function(err, hash) {
		if(err) throw err;
		cuerpo.pass=hash
		console.log(cuerpo)
    db.query(sql, [cuerpo], (err,data)=> {
		if(err) throw err;
		res.redirect('/')
		
	})
});
				
			}
			
		})
	}else{
		res.render('register' , {
				titulo: 'Register',
				error: 'Por favor registre un usuario nuevo'
				
			})
		
		
	}
	
	
	
})




//autenticacion (login)
app.post('/login', (req,res)=> {
	let user = req.body.user
	let pass = req.body.pass
	let sql = "SELECT * FROM users WHERE user =? AND pass=?"
	if(user && pass) {
		db.query(sql, [user,pass], (err,data)=> {
			if(err) throw err;
			if(data.length>0) {
				req.session.logueado = true // agregamos una propiedad al objeto
				req.session.user = user
				
				console.log(req.session.logueado)
				res.render('index', {
					titulo: 'Inicio',
					logueado : req.session.logueado,
					user : req.session.user
				})
			}else {
				res.render('login' , {
				titulo: 'Login',
				error: 'Nombre de usuario o contrasena incorrecto'
				
			})
				
			}
			
		})
	}else{
		res.render('login' , {
				titulo: 'Login',
				error: 'Por favor escriba usuario y contrasena para ingresar'
				
			})
		
		
	}
	
})

app.get('/logout', (req,res) => {
	req.session.destroy(function (err) {
		if(err) res.send(`se produjo este error ${err.code}`)
	})
	
	res.render('index', {
		titulo: 'Inicio'
		
	})
})



app.listen(3000, (req,res)=> {
	console.log('Servidor online')
	
})