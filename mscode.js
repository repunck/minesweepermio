$('document').ready(function() {
    var contenedor = $('.contenedor');
    var celda = "";
    var primerClick = true;
    var primerCuadro = "";
    var tiempoUsado = 0;
    var tablero = [];
    var minasPuestas = 0;
    var cuadros = [];
    var gameOver = false;
    var minasT = "";
    var tamanio = [[10,10,10],[20,20,40],[30,20,100],[40,20,145]];
    var cols = 0;
    var filas = 0;
    var lasminas = 0;
    var banderasRestantes = 0;
    var numCeldas = 0;

    function idCuadro(coordx, coordy){
	var x = coordx.toString();
	var y = coordy.toString();
	return 'ex'+x+'ye'+y;
    };

    function Cuadro(coordx, coordy) {
	this.coordx = coordx;
	this.coordy = coordy;
	this.estado = "";
	this.minaTocada = 0;
	this.escondida = true;
	this.marcada = false;
    };

    function cambiaTablero(){
	for (var i=2; i<=4; i++) {
	    $('#but'+i).attr("checked",false);
	};
	var botPres = 1;
	$('#but'+botPres).attr("checked","checked");
	$('.tablero').click(function(){
	    $('.cambiaTablero').css("display","block");
	    for (var j=1; j<=4; j++){

		(function(arg){
		    $('#but'+arg).click(function(){
			botPres = arg;
			for (var k=1; k<=4; k++){
			    var status = $('#but'+k).attr("checked");
			    if (k != arg && status === "checked"){
				$('#but'+k).attr("checked",false);
			    };
			};
		    });
		})(j);		
	    }

	    $('.play').click(function(){
		$('.cambiaTablero').css("display","none");
		if(botPres === 4){
		    cols = $('#ancho').attr("value");
		    filas = $('#alto').attr("value");
		    lasminas = $('#minas').attr("value");
		} else {
		    cols = size[botPres-1][0];
		    filas = size[botPres-1][1];	
		    lasminas = size[botPres-1][2];
		};
		inicia(cols, filas, lasminas);
	    });
	});
    };

    function desplegar(columnas,filas){
	tablero = [];
	contenedor.append('<button class="tablero">Cambia de tablero</button>');
	for (var i=1; i<=filas; i++) {
            for (var j=1; j<=columnas; j++){
		var celda = new Cuadro(j, i);
		tablero.push(celda);
		celda = idCuadro(j, i);
		contenedor.append('<div class="cuadro" id="'+celda+'"></div>');
	    };
	};
	console.log(tablero);
	contenedor.append('<div class="info flags"><p>Banderas restantes: '+banderasRestantes+'</p></div>');
	contenedor.append('<div class="info timer"><p>Tiempo usado: '+tiempoUsado+'</p></div>');
    };

    //function to locate square on board and then call function on it
    function revisaTablero(coordx,coordy,callback) {
	for (var lacelda = 0; lacelda < numCeldas; lacelda++) {
	    if (tablero[lacelda].coordx === coordx && tablero[lacelda].coordy === coordy){
		return callback(lacelda);
	    };
	};
    };

    //Check each surrounding square
    function ciclaCuadros(cox, coy){
	console.log('ciclaCuadros'+cox+' '+coy);
	for (var m = cox-1; m <= cox+1; m++){
	    for (var n = coy-1; n <= coy+1; n++){
		revisaTablero(m, n, function(unacelda){					
		    if (tablero[unacelda].escondida === true && tablero[unacelda].marcada === false){
			switch(tablero[unacelda].estado){
			case "t":
			    tablero[unacelda].escondida = false;
			    celda = idCuadro(m, n);
			    minasT = tablero[unacelda].minaTocada.toString();
		   	    $('#'+celda).replaceWith('<div class="cuadro revela" id="'+celda+'"><p class="minas'+minasT+'">'+minasT+'</p></div>');
			    break; 
			case "e":
			    tablero[unacelda].escondida = false;
			    celda = idCuadro(m, n);
			    $('#'+ celda).replaceWith('<div class="cuadro revela" id="'+celda+'"></div>');	
			    cuadros.push([m,n]);
			    break; 
			};	
		    };
		});
	    };
	};
	for (var q = 0; q < cuadros.length; q++){
	    var x = cuadros[q][0];
	    var y = cuadros[q][1];
	    cuadros.shift();
	    ciclaCuadros(x,y);
	};
    };

    function revelaMinas(coordx, coordy, unacelda){
	for (var i = 1; i <= cols; i++) {
	    for (var j = 1; j <= filas; j++){
		revisaTablero(i, j, function(lacelda){					
		    if(tablero[lacelda].estado === "m"){
			celda = idCuadro(i, j);
			$('#'+celda).replaceWith('<div class="square reveal" id="'+celda+'"><img src="http://res.cloudinary.com/repunck/image/upload/v1456964231/dieskull_dj9nda.png" class="skull"></div>');			
		    };
		});
	    };
	};	
	celda = idCuadro(coordx, coordy);
	$('#'+celda).replaceWith('<div class="square reveal mineHit" id="'+celda+'"><img src="http://res.cloudinary.com/repunck/image/upload/v1456964231/dieskull_dj9nda.png" class="skull"></div>');
    };

    function revela(cx, cy, ocupacion, lacelda){
	console.log(cx+' '+cy+' '+ocupacion+' '+lacelda);
	if (ocupacion === "t" && tablero[lacelda].escondida === true){
	    tablero[lacelda].escondida = false;
	    celda = idCuadro(cx, cy);
	    minasT = tablero[lacelda].minaTocada.toString();
	    $('#'+celda).replaceWith('<div class="cuadro revela" id="'+celda+'"><p class="minas'+minasT+'">'+minasT+'</p></div>');
    	};
    	if (ocupacion === "e" && tablero[lacelda].escondida === true){	
	    tablero[lacelda].escondida = false;
	    celda = idCuadro(cx, cy);
	    $('#'+ celda).replaceWith('<div class="cuadro revela" id="'+celda+'"></div>');	
	    ciclaCuadros(cx, cy);
	};
    };

    function clickIzq(coordx, coordy){
	if(primerClick) {
	    updateTimer = setInterval(function(){
		tiempoUsado += 1;
		$('.timer p').text("Tiempo usado: "+tiempoUsado);
	    },1000);

	    //update squares in and around clicked square as empty
	    for (var i = coordx-1; i <= coordx+1; i++){
		for (var j = coordy-1; j <= coordy+1; j++){
		    revisaTablero(i, j, function(celda){
			tablero[celda].estado = "e";
		    });
		};
	    };

	    //randomly assign mines to squares
	    while (minasPuestas < lasminas){
		var a = parseInt(Math.random() * cols);
		var b = parseInt(Math.random() * filas);	
		revisaTablero(a, b, function(celda){
		    if (tablero[celda].estado != "e" && tablero[celda].estado != "m") {
			tablero[celda].estado = "m";	
			minasPuestas += 1;
		    }	
		});
	    };

	    //update squares around mines with numbers
	    for (var k = 0; k < numCeldas; k++){
		if (tablero[k].estado === "m"){
		    var c = tablero[k].coordx;
		    var d = tablero[k].coordy;
		    for (var l = c-1; l <= c+1; l++){
			for (var m = d-1; m <= d+1; m++){
			    revisaTablero(l, m, function(celda){
				if (tablero[celda].estado != "m"){
				    tablero[celda].minaTocada += 1; 
				    tablero[celda].estado = "t"; 
				};
			    });
			};
		    };
		};
	    };

	    //update all remaining squares as empty
	    for (var n = 0; n < numCeldas; n++){
		if (tablero[n].estado === ""){
		    tablero[n].estado = "e";
		};
	    };
	    primerClick = false;
	}

	//Reveal square(s)
	if (!gameOver){
	    revisaTablero(coordx, coordy, function(celda){
		if (tablero[celda].marcada === false){
		    switch (tablero[celda].estado) {
		    case "m":
			gameOver = true;
			clearInterval(updateTimer);
			revelaMinas(coordx, coordy, celda);
			contenedor.append('<button class="play">Jugar otra vez</button>');
			$('.play').click(function(){
			    inicia(cols, filas, lasminas);
			});
			break;
		    case "e":
			revela(coordx, coordy, "e", celda);
			break;
		    case "t":
			revela(coordx, coordy, "t", celda);
			break;
	    	    };
	    	}
	    });
	};
    };

    function clickDer(coox, cooy, onecell){
	if (!gameOver){
	    revisaTablero(coox, cooy, function(lacelda){
		if (tablero[lacelda].escondida === true){
		    switch (tablero[lacelda].marcada){
		    case false:
			if (banderasRestantes > 0){
			    tablero[lacelda].marcada = true;
			    $('#'+onecell).append('<img src="http://res.cloudinary.com/repunck/image/upload/v1456964237/dieflag_ekiaw9.png" class="flagged">');
			    banderasRestantes -= 1;
			    $('.flags p').text("Banderas restantes: "+banderasRestantes);
			};
			break;
		    case true:
			tablero[lacelda].marcada = false;
			$('#'+onecell+' img').remove();
			banderasRestantes += 1;
			$('.flags p').text("Banderas restantes: "+banderasRestantes);
			break;
		    };									
		};
	    });
	};
    };

    function escuchador(){
	for (var i=1; i<=cols; i++) {
	    for (var j=1; j<=filas; j++){

		celda = idCuadro(i, j);
		(function(k, l, m){
		    $('#'+ m).click(function(){
			clickIzq(k, l);
		    });
		})(i, j, celda);
		(function(k, l, m){
		    $('#'+ m).bind("contextmenu",function(event){
			event.preventDefault();
			clickDer(k, l, m);
		    });
		})(i, j, celda);
	    };
	};
    };

    function inicia(med1, med2, minas){
	$('.contenedor div').remove();
	$('.contenedor button').remove();
	cols = med1;
	filas = med2;
	lasminas = minas;
	banderasRestantes = minas;
	numCeldas = filas * cols;
	var ancho = (cols * 40).toString();
	var alto = (filas * 40).toString();
	contenedor.css({"width": ancho+"px", "height": alto+"px"});
	desplegar(cols, filas);	
	cambiaTablero();
	escuchador();
    };

    inicia(10,10,10);
});
