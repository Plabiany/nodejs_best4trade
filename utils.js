module.exports = {

	add_secs_to_time: function (hour, secs_to_add){
	  secs = parseInt(parseInt(hour[0]+hour[1]) * 3600) + (parseInt(hour[3]+hour[4]) * 60) + (parseInt(hour[6]+hour[7]))
	  secs += secs_to_add
	  var a = {};	

	  if ((secs/3600) < 10)
	    a = '0'+parseInt((secs / 3600)).toString()+":"+parseInt((secs % 3600) / 60).toString()+":"+parseInt(secs % 60).toString()
	  
	  else if ((((secs%3600)/60) < 10) && ((secs % 60) < 10))
	    a = parseInt(secs / 3600).toString()+":0"+parseInt((secs % 3600) / 60).toString()+":0"+parseInt(secs % 60).toString()
	  
	  else if (((secs % 3600)/60) < 10)
	    a = parseInt(secs / 3600).toString()+":0"+parseInt((secs % 3600) / 60).toString()+":"+parseInt(secs % 60).toString()	

	  else if ((secs%60) < 10)
	    a = parseInt(secs / 3600).toString()+":"+parseInt((secs % 3600) / 60).toString()+":0"+parseInt(secs % 60).toString()
	  
	  else if (((secs/3600) < 10) && (((secs % 3600) / 60) < 10))
	    a = '0'+parseInt(secs / 3600).toString()+":0"+parseInt((secs % 3600) / 60).toString()+":"+parseInt(secs % 60).toString()	

	  else if (((secs/3600) < 10) && ((secs % 60) < 10))
	    a = '0'+parseInt(secs / 3600).toString()+":"+parseInt((secs % 3600) / 60).toString()+":0"+parseInt(secs % 60).toString()	

	  else
	    a = parseInt(secs / 3600).toString()+":"+parseInt((secs % 3600) / 60).toString()+":"+parseInt(secs % 60).toString()
	  
	  return a	

	},	

	getObject: function (){
	    var vazio = new Object();
	    vazio.opeNum = " ";
	    vazio.time = " ";
	    vazio.rull = " ";
	    vazio.operation = " ";
	    vazio.symbol = " ";
	    vazio.amount = " ";
	    vazio.price = " ";
	    vazio.value = " ";
	    vazio.time2 = " ";
	    vazio.rull2 = " ";
	    vazio.price2 = " ";
	    vazio.value2 = " ";
	    vazio.result = " ";
	    return vazio
	},	

	getObjectClosed: function(openum, time, rull, operation, symbol, amount, price, value, time2, rull2, price2, value2){
		if(value != undefined){
		var valueFixed = value.replace(/,/g, '.');
		var value2Fixed = value2.replace(/,/g, '.');} 
	    var otheresult = 0;
	    if (operation === 'venda'){
	      otheresult = parseFloat(valueFixed).toFixed(3) - parseFloat(value2Fixed).toFixed(3);
	    }else if (operation === 'compra'){
	      otheresult = parseFloat(value2Fixed).toFixed(3) - parseFloat(valueFixed).toFixed(3);
	    }
   	
	   	var ajustresult = otheresult.toString();
	   	var resultSendFixed = getResultFixed0(ajustresult, otheresult);


	    var tableClosedLine = new Object();	
	    //openum, time, rull, operation, symbol, amount, price, value, time2, rull2, price2, value2, result
	    tableClosedLine.opeNum = openum;
	    tableClosedLine.time = time;
	    tableClosedLine.rull = rull;
	    tableClosedLine.operation = operation;
	    tableClosedLine.symbol = symbol;
	    tableClosedLine.amount = amount;
	    tableClosedLine.price = price;
	    tableClosedLine.value = value;
	    tableClosedLine.time2 = time2;
	    tableClosedLine.rull2 = rull2;
	    tableClosedLine.price2 = price2;
	    tableClosedLine.value2 = value2;
	    tableClosedLine.result = resultSendFixed.toString();	

	    return [tableClosedLine, resultSendFixed.toString(), otheresult]
	},	

	framework: function (listopen, listclose, new_date, total1time, vazio, sinal, preg_consolidado, preg_numero, consol){
		var framew = [];
		framew.push(listopen); // 1 - lista tabela ativos
		framew.push(listclose); //2 - lista tabela fechadas
		framew.push(new_date);// 3 - nova data
		framew.push(total1time); // 4 - nova hora
		framew.push(vazio); // 5 - lista tabela ativos
		framew.push(sinal); // 6-sign
		framew.push(preg_consolidado);
		framew.push(preg_numero);
		framew.push(consol);
		return framew;
	},

	exclude_position: function(listOpen,opeNum){
	  var newList = [];
	  //var newListAtv = [];
	  var position = 0;
	  var ResultsColumns = [];	

	  for (var i = 0; i < listOpen.length; i++){
	    
	    if(listOpen[i].opeNum === opeNum){	

	      position = i;
	      ResultsColumns.push(listOpen[i].time);
	      ResultsColumns.push(listOpen[i].rull);
	      ResultsColumns.push(listOpen[i].operation);
	      ResultsColumns.push(listOpen[i].symbol);
	      ResultsColumns.push(listOpen[i].amount);
	      ResultsColumns.push(listOpen[i].price);
	      ResultsColumns.push(listOpen[i].value);
	    
	    }else{	

	      newList.push(listOpen[i]);
	      //newListAtv.push(listAtive[i]);	

	    }
	  }
	  return [newList, ResultsColumns];
	},

	addDays: function(date, days) {
	  //console.log('ADD'+date);
	  var new_date = date[3]+date[4]+'/'+date[0]+date[1]+'/'+date[6]+date[7]+date[8]+date[9];
	  //console.log(new_date);
	  var result = new Date(new_date);
	  result.setDate(result.getDate() + days);
	  return result;
	},

	dayFormat(tdate){
		var dat_0 = tdate;
		//console.log('dat_0'+dat_0);
	    var new_dat_0 = {};
	    if( dat_0[1] === '/' && dat_0[3] != '/'){
	        new_dat_0 = dat_0[2]+dat_0[3]+'/0'+dat_0[0]+'/'+dat_0[5]+dat_0[6]+dat_0[7]+dat_0[8]             
	       //console.log('new_dat_0 '+new_dat_0);
	    }else if(dat_0[1] === '/' && dat_0[3] === '/'){
	    	new_dat_0 = '0'+dat_0[2]+'/0'+dat_0[0]+'/'+dat_0[4]+dat_0[5]+dat_0[6]+dat_0[7]
	    }
	    return new_dat_0
	},

	delay: function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	getObjDict: function(opeNum, time, rull, operation, symbol, amount, price, value){
		var priceVirgule = price.replace(/,/g, '.'); 
		var valuePoint = value.replace(/\./g, ','); 
		//console.log(rull);
		
		var objOpen = {'opeNum' : opeNum, 'time' : time, 'rull' : rull, 'operation' : operation, 'symbol' : symbol, 'amount' : amount, 'price' : priceVirgule, 'value' : valuePoint }
		return objOpen
	},

	getResultFixed: function(ajustresult){
		var resultSend = false;
		if(ajustresult[0] === '0'){ 
	   		resultSend = true;	
	   	}else if(ajustresult[0] === '-' && ajustresult[1] === '0'){
	   		resultSend = true;
	   	}else{
	   		resultSend = false;
	   	}
	   	return resultSend
	},

	getResultFixedConsole: function(ajustresult, otheresult){
		var resultSend = {};
		if(ajustresult[0] === '0'){ 
	   		resultSend = parseInt(otheresult * 1000);	

	   	}else if(ajustresult[0] === '-' && ajustresult[1] === '0'){
	   		resultSend = parseInt(otheresult * 1000);
	   	
	   	}else{
	   		resultSend = parseFloat(otheresult).toFixed(3);
	   	
	   	}
	   	return resultSend
	}
};

function getResultFixed0(ajustresult, otheresult){
	var resultSend = {};
	if(ajustresult[0] === '0'){ 
   		resultSend = parseInt(otheresult * 1000);	
   	}else if(ajustresult[0] === '-' && ajustresult[1] === '0'){
   		resultSend = parseInt(otheresult * 1000);
   	}else{
   		resultSend = parseFloat(otheresult).toFixed(3);
   	}
   	return resultSend
} 
