$('document').ready(function() {
    "use strict";

    /**
     * idCuadro - genera nombre de coordenada para la celda
     * @param {number} cx coordenada x de esta celda
     * @param {number} cy corrdenada y de esta celda
     * @return {string} entrega nombre completo de la coordenada, formato ex3ye5
     */
    function idCuadro(cx, cy){
	var x = cx.toString();
	var y = cy.toString();
	return 'ex'+x+'ye'+y;
    }

    /**
     * revisaTablero - selecciona el objeto en el arreglo "tablero" que corresponda con las coordenadas recibidas y regresa su id
     * @param {number} cx coordenada x de esta celda
     * @param {number} cy corrdenada y de esta celda
     * @param {number} nCeldas el numero de celdas totales sobre el que iterar
     * @param {function} callback para mandar la respuesta de manera asincrona
     * @return {number} si todo sale bien, regresamos un natural, si no, regresamos un -1 .
     */
    function revisaTablero(cx, cy, nCeldas, callback) {
	// console.log('revisaTablero: '+cx+' '+cy+' '+nCeldas);
	for (var lacelda = 0; lacelda < nCeldas; lacelda++) {
	    if (tablero[lacelda].cx === cx && tablero[lacelda].cy === cy){
		return callback(lacelda);
	    }
	    else {
		if(lacelda === nCeldas-1) {
		    return callback(-1);
		}
	    }
	}
    }

    /**
     * desplegar - appendeamos a .contenedor el botón para cambiar dimensiones del tablero, 
     * metemos cada celda al arreglo "tablero", y appendeamos cada cuadro con su nombre  a .contenedor
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
		    'nombre': idCuadro(j,i),
		    'cx': j,
		    'cy': i,
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
    }

    /**
     * generaCheckbox - Para cumplir con el requisito de "don't make functions within a loop"
     * @param {number} checkid el id del checkbox que queremos dar de alta cuando se le da check
     */
    function generaCheckbox(checkid) {
	$('#check'+checkid).click(function(){
	    botPres = checkid;
	});	
    }

    /**
     * cambiaTablero - Desplegamos panel para cambiar dimensiones del tablero.
     * Una vez seleccionado el tamaño del tablero, si le dan click a .jugar
     * mandamos pedir el iniciador con las medidas correspondientes y reiniciamos el juego
     * @param {number} check_ed el checkbox que debe estar presionado al principio de esta 
     */
    function cambiaTablero(check_ed){
	botPres = check_ed;
	$('#check'+botPres).attr("checked","checked");
	
	$('.tablero').click(function(){
	    $('.cambiaTablero').css("display","block");
	    for (var j=1; j<=4; j++){
		generaCheckbox(j);
	    }

	    $('.jugar').click(function(){
		var padre, cols, fils, mins;
		if (botPres === 4) {
		    cols = parseInt($('#ancho').attr("value"));
		    fils = parseInt($('#alto').attr("value"));
		    mins = parseInt($('#minas').attr("value"));
		}
		else {
		    padre = $('#check'+botPres).parent().parent().attr('id');
		    cols = parseInt($('#'+padre+' > span.col3').html());
		    fils = parseInt($('#'+padre+' > span.col2').html());
		    mins = parseInt($('#'+padre+' > span.col4').html());
		}
		$('.cambiaTablero').css("display","none");
		tablero = [];
		clearInterval(temporizador);
		inicia(cols, fils, mins, botPres);
	    });
	});
    }

    /**
     * Iteramos hasta que las minasPuestas equivalgan al total de minas, 
     * lo hacemos con este formato para evitar eso de "don't make functions within a loop"
     * Durante la iteracion, colocamos minas en celdas vacias random del arreglo tablero
     * @param {number} minasPuestas número inicial de minas, o sea 0
     * @param {number} cuantasminas número de minas a colocar
     * @param {number} numDeCeldas número total de celdas 
     * @param {number} ctascols número de columnas para randomizar
     * @param {number} ctasfilas número de filas para randomizar
     * @param {function} callback para regesar la respuesta de la función
     * @return {string} mandamos "ok" cuando se acaban de poner las minas de manera random
     */
    function insertaMinas(minasPuestas, cuantasminas, numDeCeldas, columnas, filas, callback) {
	// console.log('insertaMinas: '+minasPuestas+' '+cuantasminas+' '+numDeCeldas+' '+ctascols+' '+ctasfilas);
	while(minasPuestas < cuantasminas) {
	    var cx = parseInt(Math.random() * columnas) + 1;
	    var cy = parseInt(Math.random() * filas) + 1;
	    revisaTablero(cx, cy, numDeCeldas, function(celda){
		if (celda !== -1) {
		    if (tablero[celda].estado !== "e" && tablero[celda].estado !== "m") {
			tablero[celda].estado = "m";	
			minasPuestas++;
		    }
		}
	    });	
	    if (minasPuestas === cuantasminas) {
		return callback('ok');
	    }
	}
	
	/*
	if (minasPuestas === cuantasminas) {
	    return callback('ok');
	}
	else {
	    setTimeout(function(){
		var a = parseInt(Math.random() * columnas) + 1;
		var b = parseInt(Math.random() * filas) + 1;
		revisaTablero(a, b, numDeCeldas, function(celda){
		    // console.log(celda);
		    if (celda !== -1) {
			if (tablero[celda].estado !== "e" && tablero[celda].estado !== "m") {
			    tablero[celda].estado = "m";	
			    minasPuestas++;
			    // console.log('minasp: '+minasPuestas+' celda: '+celda);
			    return insertaMinas(minasPuestas, cuantasminas, numDeCeldas, columnas, filas, callback);
			}
			else {
			    return insertaMinas(minasPuestas, cuantasminas, numDeCeldas, columnas, filas, callback);
			}
		    }
		    else {
			return insertaMinas(minasPuestas, cuantasminas, numDeCeldas, columnas, filas, callback);
		    }
		});	
	    }, 0);
	}
	 */
    }

    /**
     * actualizaAdyacentes - Saqué esta función para cumplir con la regla de "don't make functions within a loop"
     * Esta función manda a llamar revisaTablero para cada celda adyacente a una mina y actualiza su estado a t
     * @param {number} unax coordenada x
     * @param {number} unay coordenada y
     * @param {number} numeroCeldas total de celdas
     */
    function actualizaAdyacentes(unax, unay, numeroCeldas){
	revisaTablero(unax, unay, numeroCeldas, function(celda){
	    if (celda !== -1) {
		if (tablero[celda].estado !== "m"){
		    tablero[celda].minasTocadas++; 
		    tablero[celda].estado = "t"; 
		    // console.log(celda);
		}
	    }
	});
    }

    /**
     * cuadrosAdyacentes - Encontramos los cuadros adyacentes a las minas y los marcamos. 
     * Sumamos 1 por cada mina si el cuadro es adyacente a más de una mina.
     * @param {number} numeroCeldas numero total de celdas
     * @param {number} columnas numero de columnas
     * @param {number} filas numero de filas
     * @param {function} callback para regresar la respuesta
     * @return {string} mandamos "ok" cuando se acaban de marcar las celdas adyacentes a las minas
     */
    function cuadrosAdyacentes(numeroCeldas, columnas, filas, callback) {
	for (var c = 0; c < numeroCeldas; c++) {
	    if (tablero[c].estado === 'm') {
		var cox = tablero[c].cx;
		var coy = tablero[c].cy;
		for (var x = cox-1; x <= cox+1; x++){
		    for (var y = coy-1; y <= coy+1; y++){
			if (x > 0 && x < columnas+1 && y > 0 && y < filas+1) {
			    actualizaAdyacentes(x, y, numeroCeldas);
			}
		    }
		}
	    }
	    if (c === numeroCeldas-1) {
		return callback('ok');
	    }
	}
    }

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
	    }
	    if (n === numeroDeCeldas-1) {
		// console.log('vacias: '+vacias);
		return callback('ok');
	    }
	}
    }

    /**
     *
     *
     *
     *
     */
    function ciclaFilas(cuadros, cox, coymenos, coymas, columnas, filas, numeroCeldas, callback){
	var unomas = coymenos+1;
	if (unomas > coymas+1) {
	    return callback(cuadros);
	}
	else {
	    setTimeout(function(){
		if (coymenos > 0 && coymas < filas) {
		    revisaTablero(cox, coymenos, numeroCeldas, function(unacelda){
			if (tablero[unacelda].escondida === true && tablero[unacelda].marcada === false){
			    switch(tablero[unacelda].estado){
			    case "t":
				tablero[unacelda].escondida = false;
				var mtocadas = tablero[unacelda].minasTocadas.toString();
				$('#'+idCuadro(cox,coymenos)).replaceWith('<div class="cuadro revela" id="'+idCuadro(cox,coymenos)+'"><p class="minas'+mtocadas+'">'+mtocadas+'</p></div>');
				celdasReveladas++;
				break; 
			    case "e":
				tablero[unacelda].escondida = false;
				$('#'+idCuadro(cox,coymenos)).replaceWith('<div class="cuadro revela" id="'+idCuadro(cox,coymenos)+'"></div>');
				cuadros.push([cox,coymenos]);
				celdasReveladas++;
				break; 
			    }
			    return ciclaFilas(cuadros, cox, unomas, coymas, columnas, filas, numeroCeldas, callback);
			}
			else {
			    return ciclaFilas(cuadros, cox, unomas, coymas, columnas, filas, numeroCeldas, callback);
			}
		    });
		}
		else {
		    return ciclaFilas(cuadros, cox, unomas, coymas, columnas, filas, numeroCeldas, callback);
		}
	    }, 0);
	}
    }

    function ciclaColumnas(cuadros, coxmenos, coxmas, coy, columnas, filas, numeroCeldas, callback) {
	var masuno = coxmenos+1;
	if (masuno > coxmas+1) {
	    return callback(cuadros);
	}
	else {
	    setTimeout(function(){
		if (coxmenos > 0 && coxmas < columnas) {
		    ciclaFilas([], coxmenos, coy-1, coy+1, columnas, filas, numeroCeldas, function(cuadritos){
			var arr_cuadros = cuadros.concat(cuadritos);
			return ciclaColumnas(arr_cuadros, masuno, coxmas, coy, columnas, filas, numeroCeldas, callback);
		    });
		}
		else {
		    return ciclaColumnas(cuadros, masuno, coxmas, coy, columnas, filas, numeroCeldas, callback);
		}
	    },0);
	}
    }

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
	// console.log('ciclaCuadros'+cox+' '+coy);
	ciclaColumnas([], cox-1, cox+1, coy, lospostes, lashileras, elNumCeldas, function(cuadros){
	    for (var q = 0; q < cuadros.length; q++){
		var x = cuadros[q][0];
		var y = cuadros[q][1];
		cuadros.shift();
		ciclaCuadros(x, y, lospostes, lashileras, elNumCeldas);
	    }
	});
    }

    /**
     * Si alguien pisa una mina, revelamos donde estaban todas las otras minas
     * @param {number} coordx coordenada x
     * @param {number} coordy coordenada y
     * @param {number} postes total de columnas
     * @param {number} hileras total de filas
     * @param {number} todaslasceldas total de celdas en el tablero
     */
    function revelaMinas(coordx, coordy, postes, hileras, todaslasceldas){
	for (var ce = 0; ce < todaslasceldas; ce++) {
	    if (tablero[ce].estado === 'm') {
		$('#'+tablero[ce].nombre).replaceWith('<div class="cuadro revela" id="'+tablero[ce].nombre+'"><img src="'+skull+'" class="skull"></div>');
	    }
	}
	$('#'+idCuadro(coordx, coordy)).replaceWith('<div class="cuadro revela mineHit" id="'+idCuadro(coordx, coordy)+'"><img src="'+skull+'" class="skull"></div>');
    }

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
    	}
    	if (tipo === "e" && tablero[lacelda].escondida === true){	
	    tablero[lacelda].escondida = false;
	    $('#'+idCuadro(cx, cy)).replaceWith('<div class="cuadro revela" id="'+idCuadro(cx, cy)+'"></div>');
	    celdasReveladas++;
	    ciclaCuadros(cx, cy, postes, hileras, numDeCelds);
	}
    }

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
			    inicia(unascolumnas, unasfilas, algunasminas, botPres);
			});
			break;
		    case "e":
			revela(coordx, coordy, "e", unascolumnas, unasfilas, numeroCeldas, celda);
			if(celdasReveladas === numeroCeldas - algunasminas) {
			    gameWon = true;
			    clearInterval(temporizador);
			    contenedor.append('<button class="play">¡¡¡Ganaste!!!, ¿jugar otra vez?</button>');
			    $('.play').click(function(){
				inicia(unascolumnas, unasfilas, algunasminas, botPres);
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
				inicia(unascolumnas, unasfilas, algunasminas, botPres);
			    });
			}
			break;
	    	    }
	    	}
	    });
	}
    }

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
			}
			break;
		    case true:
			tablero[lacelda].marcada = false;
			$('#'+onecell+' img').remove();
			banderasRestantes++;
			$('.flags p').text("Banderas restantes: "+banderasRestantes);
			break;
		    }
		}
	    });
	}
    }

    function seteadorClickIzq(col, fil, numeroCeldas, columnas, filas, nombreCelda, unasminas) {
	$('#'+ nombreCelda).click(function(){
	    clickIzq(col, fil, numeroCeldas, columnas, filas, unasminas);
	});	
    }

    function seteadorClickDer(col, fil, nombreCelda, numeroCeldas) {
	$('#'+ nombreCelda).bind("contextmenu",function(event){
	    event.preventDefault();
	    clickDer(col, fil, nombreCelda, numeroCeldas);
	});	
    }

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
		seteadorClickIzq(i, j, numeroCeldas, xcolumnas, yfilas, idCuadro(i, j), unasminas);
		seteadorClickDer(i, j, idCuadro(i, j), numeroCeldas);
	    }
	}
    }


    function inicia(med1, med2, minas, check){
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
	botPres = check;

	var ancho = (med1 * 30).toString();
	var alto = (med2 * 30).toString();
	contenedor.css({"width": ancho+"px", "height": alto+"px"});
	// desplegamos tablero, insertamos minas, marcamos cuadros adyacentes y establecemos los que estan vacios
	desplegar(med1, med2, function(pintaceldas){
	    if (pintaceldas === 'ok') {
		console.log('pintaceldas ok');
		insertaMinas(0, minas, numCeldas, med1, med2, function(minas){
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
	cambiaTablero(botPres);
	// inicializamos el escuchador de eventos internos
	escuchador(numCeldas, med1, med2, minas);	
    }


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
    var botPres = 1;

    inicia(10, 10, 10, 1);
});
