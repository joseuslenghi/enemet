		var connected_flag=0	
		var mqtt;
		var reconnectTimeout = 2000;
		var arrObj;
		var stopic1;
		var stopic2;

		//Recuperado de datos del localStorage
		if (localStorage.getItem('items')) {
			arrObj = JSON.parse(localStorage.getItem('items'))
		} else {
			arrObj = [{}];
			//arrObj = [{"timestamp":d,"topic":null,"medicion":null}];
		}




		function MQTTconnect() {
			document.getElementById("messages").innerHTML ="";
			var s = document.forms["connform"]["server"].value;
			var p = document.forms["connform"]["port"].value;
			var mqttuser = document.forms["connform"]["username"].value;
			var mqttpass = document.forms["connform"]["password"].value;
				if (p!=""){
					console.log("ports");
					port=parseInt(p);
					console.log("port" +port);
					}
				if (s!=""){
					host=s;
					console.log("host");
					}

			console.log("connecting to "+ host +" "+ port);
			mqtt = new Paho.MQTT.Client(host,port,"clientjsaaa");

			mqtt.onConnectionLost = onConnectionLost;
			mqtt.onMessageArrived = onMessageArrived;
			//document.write("connecting to "+ host);

			if((mqttpass||mqttuser)!=""){
				var options = {
					userName:mqttuser,
					password:mqttpass,
					onSuccess: onConnect,
					onFailure: onFailure,
					useSSL: true};
				}
			else{
					var options = {
						//userName:mqttuser,
						//password:mqttpass,
						onSuccess: onConnect,
						onFailure: onFailure,
						useSSL: true};
			}
			mqtt.connect(options);
			return false;
		}


		function onConnectionLost(){
			console.log("connection lost");
			document.getElementById("status").innerHTML = "Connection Lost";
			document.getElementById("messages").innerHTML ="Connection Lost";
			connected_flag=0;
		}


		function onFailure(message) {
			console.log("Failed");
			document.getElementById("messages").innerHTML = "Connection Failed- Retrying";
			setTimeout(MQTTconnect, reconnectTimeout);
			}


		function onMessageArrived(r_message){
			var d = new Date();
			var n = d.toLocaleString();
			
			out_msg="Message received: Topic: "+r_message.destinationName+"// message"+r_message.payloadString+" timestamp: "+n;
			
			//console.log("Message received ",r_message.payloadString);
			console.log(r_message.destinationName);
	
			document.getElementById("messages").innerHTML =out_msg;
			arrObj.push({"timestamp":d,"topic":r_message.destinationName,"medicion":parseFloat(r_message.payloadString)})
			grafico();
			localStorage.setItem('items',JSON.stringify(arrObj));
			
		}

		function borrar(){
			localStorage.clear()	
			myvar="";
			arrObj = [{}];
			//arrObj = [{"timestamp":null,"topic":"","medicion":0}];
			document.getElementById('myTable').innerHTML = myvar;
			grafico()
			console.log(arrObj);
		}

		function exportar(){
			let csvContent = "data:text/csv;charset=utf-8,";
			for(let row = 0; row < arrObj.length; row++){
				let keysAmount = Object.keys(arrObj[row]).length
				let keysCounter = 0
			
				// If this is the first row, generate the headings
				if(row === 0){
			
				   // Loop each property of the object
				   for(let key in arrObj[row]){
			
									   // This is to not add a comma at the last cell
									   // The '\n' adds a new line
									   csvContent += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
					   keysCounter++
				   }
				}else{
				   for(let key in arrObj[row]){
					csvContent += arrObj[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
					   keysCounter++
				   }
				}
			
				keysCounter = 0
			}
			console.log(csvContent)
			
			
			
			var encodedUri = encodeURI(csvContent);
			var link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "my_data.csv");
			
			
			link.click(); // This will download the data file named "my_data.csv".


		}

		function onConnected(recon,url){
			console.log(" in onConnected " +reconn);
		}

		function onConnect() {
			// Once a connection has been made, make a subscription and send a message.
			document.getElementById("messages").innerHTML ="Connected to "+host +"on port "+port;
			connected_flag=1
			document.getElementById("status").innerHTML = "Connected";
			console.log("on Connect "+connected_flag);
		}




		function sub_topics(){
			document.getElementById("messages").innerHTML ="";
			if (connected_flag==0){
			out_msg="<b>Not Connected so can't subscribe</b>"
			//	console.log(out_msg);
			document.getElementById("messages").innerHTML = out_msg;
			return false;
			}

			stopic1= document.forms["subs"]["Stopic1"].value;
			stopic2= document.forms["subs"]["Stopic2"].value;
			console.log("Subscribing to topic ="+stopic1);
			if(stopic1!=""){
				mqtt.subscribe(stopic1);}
			if(stopic2!=""){
				mqtt.subscribe(stopic2);}
			
			document.getElementById("messages").innerHTML ="suscribed to "+stopic1+" "+stopic2;

			grafico()
			return false;
		}

		function send_message(){
			document.getElementById("messages").innerHTML ="";
			if (connected_flag==0){
				out_msg="<b>Not Connected so can't send</b>"
			//	console.log(out_msg);
				document.getElementById("messages").innerHTML = out_msg;
				return false;
				}

			var msg = document.forms["smessage"]["message"].value;
			console.log("el mensaje es->: "+msg);

			var topic = document.forms["smessage"]["Ptopic"].value;
			console.log("el topic es->: "+topic);
			message = new Paho.MQTT.Message(msg);
			if (topic=="")
					message.destinationName = "test-topic"
				else
					message.destinationName = topic;
				mqtt.send(message);
			return false;
		}

		function grafico(){
		
		//Cargar elementos en tabla
			var myvar=0;
			var objLength = arrObj.length;
			myvar = '<table class="table" >'+'<thead class="thead-dark">'+
			'<tr>'+
			'<th>timestamp</th>'+
			'<th>topic</th>'+
			'<th>medicion</th>'+
			'</tr>'+'</thead>';

			for(var i = 1; i < objLength; i++){
				if(arrObj[i].topic==stopic1||stopic2){	
				myvar += '<tr>'+'<td>'+arrObj[i].timestamp.toLocaleString()+'</td>'+'<td>'+arrObj[i].topic+'</td>'+'<td>'+arrObj[i].medicion+'</th>'+'</tr>'     
			}
			}
			myvar += '</table>';



			document.getElementById('myTable').innerHTML = myvar;
            console.log(arrObj);

			

		// load current chart package
		google.charts.load("current", {packages: ['corechart','line']});
        
		// set callback function when api loaded
        google.charts.setOnLoadCallback(drawChart);

			function drawChart() {
				var data = new google.visualization.DataTable();
				data.addColumn('datetime', 'Day');
				data.addColumn('number', stopic1);
				data.addColumn('number', stopic2);
			

				// create options object with titles, colors, etc.
				var options = {
					title: "Suscribed topics",
					hAxis: {title: "Time"},
					vAxis: {title: "temperatura"},
					explorer: {axis: 'horizontal'},
					interpolateNulls: true,
					legend:{position: 'top',
						alignment:'center'},
					pointsVisible: true,

				};
				// draw chart on load
				var chart = new google.visualization.LineChart(
					document.getElementById("chart_div")
				);
				//chart.draw(data, options);

				var tiempo=new Date(arrObj[1].timestamp);
				var tiempo1=new Date
				console.log(tiempo);
				console.log(tiempo1);
				// interval for adding new data every 250ms
				var largo = arrObj.length-1;
				
				var graf1;
				var graf2;
				for(var i=0;i<=largo;i++){
					med=arrObj[i].medicion;
					var tiem=new Date(arrObj[i].timestamp);

					if(arrObj[i].topic==stopic1){
						graf1=med;	
						data.addRow([tiem,graf1,null]);}

					if(arrObj[i].topic==stopic2){
						graf2=med;	
						data.addRow([tiem,null,graf2]);}
				}

				chart.draw(data, options);	
			}
		}
