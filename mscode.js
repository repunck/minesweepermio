$('document').ready(function() {
    /**
     * Generamos coordenada para cada celda
     * @param {number} coordx coordenada x de esta celda
     * @param {number} coordy corrdenada y de esta celda
     * @return {string} entrega nombre completo de la coordenada
     */
    function idCuadro(coordx, coordy){
	var x = coordx.toString();
	var y = coordy.toString();
	return 'ex'+x+'ye'+y;
    };

    /**
     * revisamos que objeto de tipo celda corresponde con estas coordenadas y devolvemos el id
     * @param {number} coordx coordenada x de esta celda
     * @param {number} coordy corrdenada y de esta celda
     * @param {number} numeroDeceldas el numero de celdas totales sobre el que iterar
     * @param {function} callback para mandar la respuesta de manera asincrona
     * @return {number} si todo sale bien, regresamos un natural, si no, regresamos un -1 .
     */
    function revisaTablero(coordx, coordy, numeroDeCeldas, callback) {
	// console.log('revisaTablero: '+coordx+' '+coordy+' '+numeroDeCeldas);
	for (var lacelda = 0; lacelda < numeroDeCeldas; lacelda++) {
	    if (tablero[lacelda].coordx === coordx && tablero[lacelda].coordy === coordy){
		return callback(lacelda);
	    }
	    else {
		if(lacelda === numeroDeCeldas-1) {
		    return callback(-1);
		}
	    }
	}
    };

    /**
     * metemos cada celda al arreglo tablero, 
     * y appendeamos cada cuadro a .contenedor
     * @param {number} columnas numero de columnas en este tablero
     * @param {number} filas numero de filas en este tablero
     * @param {function} callback para mandar la respuesta
     * @return {string} regresamos un "ok" cuando acaba de armar el arreglo "tablero" y cuando termina de poner cada celda en la pantalla
     */
    function desplegar(columnas, filas, callback){
	// console.log('desplegar: '+columnas+' '+filas);
	contenedor.append('<button class="tablero">Cambia de tablero</button>');
	for (var i = 1; i <= filas; i++) {
            for (var j = 1; j <= columnas; j++){
		var celda = {
		    'coordx': j,
		    'coordy': i,
		    'estado': '',
		    'minasTocadas': 0,
		    'escondida': true,
		    'marcada': false
		};
		tablero.push(celda);
		contenedor.append('<div class="cuadro" id="'+idCuadro(j,i)+'"></div>');
		if (i === filas && j === columnas ) {
		    return callback('ok');
		}
	    }
	}
    };

    /**
     * Desplegamos panel para cambiar dimensiones del tablero.
     * Una vez seleccionado el tamaño del tablero, si le dan click a .jugar
     * mandamos pedir el iniciador con las medidas correspondientes y reiniciamos el juego
     */
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

	    $('.jugar').click(function(){
		$('.cambiaTablero').css("display","none");
		if(botPres === 4){
		    var unascolumnas = parseInt($('#ancho').attr("value"));
		    var unasfilas = parseInt($('#alto').attr("value"));
		    var unasminas = parseInt($('#minas').attr("value"));
		    inicia(unascolumnas, unasfilas, unasminas);
		} else {
		    var padre = $('#but'+botPres).parent().parent().attr('id');
		    var ctasfilas = parseInt($('#'+padre+' > td.col2').html());
		    var ctascolumnas = parseInt($('#'+padre+' > td.col3').html());
		    var ctasminas = parseInt($('#'+padre+' > td.col4').html());
		    inicia(ctascolumnas, ctasfilas, ctasminas);
		};
	    });
	});
    };


    /**
     * Iteramos hasta que las minasYaPuestas equivalgan al total de minas
     * Durante esa iteracion, colocamos minas en celdas vacias random del arreglo tablero
     * @param {number} cuantasminas numero de minas a colocar
     * @param {number} numDeCeldas numero total de celdas 
     * @param {number} ctascols numero de columnas para randomizar
     * @param {number} ctasfilas numero de filas para randomizar
     * @param {function} callback para regesar la respuesta de la funcion
     * @return {string} mandamos "ok" cuando se acaban de poner las minas de manera random
     */
    function insertaMinas(cuantasminas, numDeCeldas, ctascols, ctasfilas, callback) {
	// console.log('insertaMinas: '+cuantasminas+' '+numDeCeldas+' '+ctascols+' '+ctasfilas);
	var minasYaPuestas = 0;
	while (minasYaPuestas < cuantasminas){
	    var a = parseInt(Math.random() * ctascols) + 1;
	    var b = parseInt(Math.random() * ctasfilas) + 1;
	    revisaTablero(a, b, numDeCeldas, function(celda){
		// console.log(celda);
		if (celda !== -1) {
		    if (tablero[celda].estado != "e" && tablero[celda].estado != "m") {
			tablero[celda].estado = "m";	
			minasYaPuestas++;		    
		    }
		}
	    });
	    if (minasYaPuestas === cuantasminas) {
		return callback('ok');
	    }
	}
    };

    /**
     * Encontramos los cuadros adyacentes a las minas y los marcamos. 
     * Sumamos 1 por cada mina si el cuadro es adyacente a más de una mina.
     * @param {number} numeroDeCeldas numero total de celdas
     * @param {number} lascolumnas numero de columnas
     * @param {number} lasfilas numero de filas
     * @param {function} callback para regresar la respuesta
     * @return {string} mandamos "ok" cuando se acaban de marcar las celdas adyacentes a las minas
     */
    function cuadrosAdyacentes(numeroDeCeldas, lascolumnas, lasfilas, callback) {
	var tocadas = 0;
	for (var k = 0; k < numeroDeCeldas; k++){
	    if (tablero[k].estado === "m"){
		var c = tablero[k].coordx;
		var d = tablero[k].coordy;
		for (var l = c-1; l <= c+1; l++){
		    for (var m = d-1; m <= d+1; m++){
			if (l > 0 && l < lascolumnas+1 && m > 0 && m < lasfilas+1) {
			    // console.log('coords adyacentes: '+l+', '+m);
			    revisaTablero(l, m, numeroDeCeldas, function(celda){
				if (celda !== -1) {
				    if (tablero[celda].estado != "m"){
					if (tablero[celda].estado != "t") {
					    tocadas++;
					}
					tablero[celda].minasTocadas += 1; 
					tablero[celda].estado = "t"; 
				    }
				}
			    });
			}
		    }
		}
	    }
	    if (k === numeroDeCeldas-1) {
		// console.log('tocadas: ' +tocadas);
		return callback('ok');
	    }
	}
    };

    /**
     * Marcamos como vacíos todos los cuadros que no tengan mina ni estén junto a una mina
     * @param {number} numeroDeCeldas numero total de celdas
     * @param {function} callback para regresar la respuesta
     * @return {string} mandamos "ok" cuando se terminan de marcar todas las celdas vacias
     */
    function marcaVacios(numeroDeCeldas, callback) {
	var vacias = 0;
	for (var n = 0; n < numeroDeCeldas; n++){
	    if (tablero[n].estado === ""){
		tablero[n].estado = "e";
		vacias ++;
	    };
	    if (n === numeroDeCeldas-1) {
		// console.log('vacias: '+vacias);
		return callback('ok');
	    }
	}
    };

    /**
     * Revisamos cada cuadro alrededor de una celda vacia para ver si tiene celdas adyacentes y/o vacias alrededor
     * si hay celdas vacías las destapamos.
     * @param {number} cox coordenada x
     * @param {number} coy coordenada y
     * @param {number} lospostes numero de columnas 
     * @param {number} lashileras numero de filas
     * @param {number} elNumCeldas numero total de celdas en el tablero
     */
    function ciclaCuadros(cox, coy, lospostes, lashileras, elNumCeldas){
	var cuadros = []; var mtocadas = 0;
	// console.log('ciclaCuadros'+cox+' '+coy);
	for (var m = cox-1; m <= cox+1; m++){
	    for (var n = coy-1; n <= coy+1; n++){
		if (m > 0 && m < lospostes+1 && n > 0 && n < lashileras+1) {
		    revisaTablero(m, n, elNumCeldas, function(unacelda){					
			if (tablero[unacelda].escondida === true && tablero[unacelda].marcada === false){
			    switch(tablero[unacelda].estado){
			    case "t":
				tablero[unacelda].escondida = false;
				mtocadas = tablero[unacelda].minasTocadas.toString();
		   		$('#'+idCuadro(m,n)).replaceWith('<div class="cuadro revela" id="'+idCuadro(m,n)+'"><p class="minas'+mtocadas+'">'+mtocadas+'</p></div>');
				celdasReveladas++;
				break; 
			    case "e":
				tablero[unacelda].escondida = false;
				$('#'+idCuadro(m,n)).replaceWith('<div class="cuadro revela" id="'+idCuadro(m,n)+'"></div>');
				cuadros.push([m,n]);
				celdasReveladas++;
				break; 
			    }	
			}
		    });
		}
	    }
	}
	for (var q = 0; q < cuadros.length; q++){
	    var x = cuadros[q][0];
	    var y = cuadros[q][1];
	    cuadros.shift();
	    ciclaCuadros(x, y, lospostes, lashileras, elNumCeldas);
	};
    };

    /**
     * Si alguien pisa una mina, revelamos donde estaban todas las otras minas
     * @param {number} coordx coordenada x
     * @param {number} coordy coordenada y
     * @param {number} postes total de columnas
     * @param {number} hileras total de filas
     * @param {number} todaslasceldas total de celdas en el tablero
     */
    function revelaMinas(coordx, coordy, postes, hileras, todaslasceldas){
	for (var i = 1; i <= postes; i++) {
	    for (var j = 1; j <= hileras; j++){
		revisaTablero(i, j, todaslasceldas, function(lacelda){					
		    if(tablero[lacelda].estado === "m"){
			$('#'+idCuadro(i,j)).replaceWith('<div class="square reveal" id="'+idCuadro(i,j)+'"><img src="'+skull+'" class="skull"></div>');
		    };
		});
	    };
	};	
	$('#'+idCuadro(coordx, coordy)).replaceWith('<div class="square reveal mineHit" id="'+idCuadro(coordx, coordy)+'"><img src="'+skull+'" class="skull"></div>');
    };

    /**
     * Al dar clic sobre una celda que no tiene mina la destapamos, si no es adyacente a una mina revisamos las 
     * celdas circundantes para destaparlas con ciclaCuadros
     * @param {number} cx coordenada x
     * @param {number} cy coordenada y
     * @param {string} tipo si toca una o varias minas es tipo t, si no toca ninguna es tipo e
     * @param {number} postes total de columnas
     * @param {number} hileras total de filas
     * @param {number} numDeCeldas total de celdas en el tablero
     * @param {number} lacelda id de celda en el arreglo "tablero"
     */
    function revela(cx, cy, tipo, postes, hileras, numDeCelds, lacelda) {
	// console.log('revela: '+cx+' '+cy+' '+tipo+' '+lacelda);
	var mtocadas = 0;
	if (tipo === "t" && tablero[lacelda].escondida === true){
	    tablero[lacelda].escondida = false;
	    mtocadas = tablero[lacelda].minasTocadas.toString();
	    $('#'+idCuadro(cx, cy)).replaceWith('<div class="cuadro revela" id="'+idCuadro(cx, cy)+'"><p class="minas'+mtocadas+'">'+mtocadas+'</p></div>');
	    celdasReveladas++;
    	};
    	if (tipo === "e" && tablero[lacelda].escondida === true){	
	    tablero[lacelda].escondida = false;
	    $('#'+idCuadro(cx, cy)).replaceWith('<div class="cuadro revela" id="'+idCuadro(cx, cy)+'"></div>');
	    celdasReveladas++;
	    ciclaCuadros(cx, cy, postes, hileras, numDeCelds);
	};
    };

    /**
     * Cuando el esuchador recibe un clic izquierdo lo manda a esta función para que defina qué hacer.
     * Si es el primer clic se inicializa el cronómetro, si no es gameOver ni gameWon se revisan las propiedades de la celda
     * con un switch para ver si es "m" (mina), "e" (vacio) o "t" (toca una mina) y dependiendo pasa la instrucción correspondiente
     * @param {number} coordx coordenada x
     * @param {number} coordy coordenada y
     * @param {number} numeroCeldas total de celdas en el tablero
     * @param {number} unascolumnas total de columnas
     * @param {number} unasfilas total de filas
     * @param {number} algunasminas total de minas
     */
    function clickIzq(coordx, coordy, numeroCeldas, unascolumnas, unasfilas, algunasminas){
	if(primerClick) {
	    temporizador = setInterval(function(){
		tiempoUsado += 1;
		$('.timer p').text("Tiempo usado: "+tiempoUsado);
	    },1000);
	    primerClick = false;
	}

	if (!gameOver && !gameWon){
	    revisaTablero(coordx, coordy, numeroCeldas, function(celda){
		// console.log('celda: '+celda);
		if (tablero[celda].marcada === false){
		    switch (tablero[celda].estado) {
		    case "m":
			gameOver = true;
			clearInterval(temporizador);
			revelaMinas(coordx, coordy, unascolumnas, unasfilas, numeroCeldas);
			contenedor.append('<button class="play">Jugar otra vez</button>');
			$('.play').click(function(){
			    inicia(unascolumnas, unasfilas, algunasminas);
			});
			break;
		    case "e":
			revela(coordx, coordy, "e", unascolumnas, unasfilas, numeroCeldas, celda);
			if(celdasReveladas === numeroCeldas - algunasminas) {
			    gameWon = true;
			    clearInterval(temporizador);
			    contenedor.append('<button class="play">¡¡¡Ganaste!!!, ¿jugar otra vez?</button>');
			    $('.play').click(function(){
				inicia(unascolumnas, unasfilas, algunasminas);
			    });
			}
			break;
		    case "t":
			revela(coordx, coordy, "t", unascolumnas, unasfilas, numeroCeldas, celda);
			if(celdasReveladas === numeroCeldas - algunasminas) {
			    gameWon = true;
			    clearInterval(temporizador);
			    contenedor.append('<button class="play">¡¡¡Ganaste!!!, ¿jugar otra vez?</button>');
			    $('.play').click(function(){
				inicia(unascolumnas, unasfilas, algunasminas);
			    });
			}
			break;
	    	    };
	    	}
	    });
	};
    };

    /**
     * Cuando el esuchador recibe un clic derecho lo manda a esta función para que ponga o quite la marca de la celda en cuestión.
     * @param {number} coox coordenada x
     * @param {number} cooy coordenada y
     * @param {string} onecell nombre del id de la celda en el dom
     * @param {number} todaslasceldas número total de celdas en el tablero
     */
    function clickDer(coox, cooy, onecell, todaslasceldas){
	if (!gameOver){
	    revisaTablero(coox, cooy, todaslasceldas, function(lacelda){
		if (tablero[lacelda].escondida === true){
		    switch (tablero[lacelda].marcada){
		    case false:
			if (banderasRestantes > 0){
			    tablero[lacelda].marcada = true;
			    $('#'+onecell).append('<img src="'+flag+'" class="flagged">');
			    banderasRestantes--;
			    $('.flags p').text("Banderas restantes: "+banderasRestantes);
			};
			break;
		    case true:
			tablero[lacelda].marcada = false;
			$('#'+onecell+' img').remove();
			banderasRestantes++;
			$('.flags p').text("Banderas restantes: "+banderasRestantes);
			break;
		    };									
		};
	    });
	};
    };

    /**
     * Activa los clics izquierdos y derechos para cada celda por id de celda
     * @param {number} numeroCeldas total de celdas en el tablero
     * @param {number} xcolumnas total de columnas 
     * @param {number} yfilas total de filas
     * @param {number} unasminas total de minas
     */
    function escuchador(numeroCeldas, xcolumnas, yfilas, unasminas){
	for (var i = 1; i <= xcolumnas; i++) {
	    for (var j = 1; j <= yfilas; j++){
		(function(k, l, m){
		    $('#'+ m).click(function(){
			clickIzq(k, l, numeroCeldas, xcolumnas, yfilas, unasminas);
		    });
		})(i, j, idCuadro(i, j));
		(function(k, l, m){
		    $('#'+ m).bind("contextmenu",function(event){
			event.preventDefault();
			clickDer(k, l, m, numeroCeldas);
		    });
		})(i, j, idCuadro(i, j));
	    };
	};
    };


    function inicia(med1, med2, minas){
	// console.log('inicia: '+med1+' '+med2+' '+minas);
	$('.contenedor div').remove();
	$('.contenedor button').remove();
	primerClick = true;
	gameOver = false;
	gameWon = false;
	tiempoUsado = 0;
	tablero = [];
	lasminas = minas;
	banderasRestantes = minas;
	celdasReveladas = 0;
	numCeldas = med2 * med1;

	var ancho = (med1 * 40).toString();
	var alto = (med2 * 40).toString();
	contenedor.css({"width": ancho+"px", "height": alto+"px"});
	// desplegamos tablero, insertamos minas, marcamos cuadros adyacentes y establecemos los que estan vacios
	desplegar(med1, med2, function(despliegue){
	    if (despliegue === 'ok') {
		console.log('despliegue ok');
		insertaMinas(minas, numCeldas, med1, med2, function(minas){
		    if (minas === 'ok') {
			console.log('minas ok');
			cuadrosAdyacentes(numCeldas, med1, med2, function(adyacentes){
			    if (adyacentes === 'ok') {
				console.log('adyacentes ok');
				marcaVacios(numCeldas, function(vacios) {
				    if (vacios === 'ok'){
					console.log('vacías ok');
				    }
				    else {
					$('.errores').html('error: No se pudieron establecer las celdas vacías');
				    }
				});
			    }
			    else {
				$('.errores').html('error: No se pudieron establecer las celdas adyacentes a las minas');
			    }
			});
		    }
		    else {
			$('.errores').html('error: No se pudo poner las minas');
		    }
		});
	    }
	    else {
		$('.errores').html('error: No se pudo desplegar el tablero');
	    }
	});
	// cuando acaban de desplegarse las celdas incluimos los indicadores
	contenedor.append('<div class="info flags"><p>Banderas restantes: '+banderasRestantes+'</p></div>');
	contenedor.append('<div class="info timer"><p>Tiempo usado: '+tiempoUsado+'</p></div>');
	// inicializamos el seleccionador de tableros
	cambiaTablero();
	// inicializamos el escuchador de eventos internos
	escuchador(numCeldas, med1, med2, minas);
    };

    // alta de variables necesarias para el juego
    var contenedor = $('.contenedor');
    var skull = "http://res.cloudinary.com/repunck/image/upload/v1456964231/dieskull_dj9nda.png";
    var flag = "http://res.cloudinary.com/repunck/image/upload/v1456964237/dieflag_ekiaw9.png";
    var primerClick = true;
    var gameOver = false;
    var gameWon = false;
    var tiempoUsado = 0;
    var tablero = [];
    var temporizador;
    var lasminas = 0;
    var banderasRestantes = 0;
    var celdasReveladas = 0;
    var numCeldas = 0;
    inicia(10, 10, 10);
});
