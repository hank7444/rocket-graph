(function(window) {


	var $tickets = $('#tickets');

	var $count8 = $('#count8');
	var $count9 = $('#count9');
	var $pie1 = $('#flot-placeholder-pie1');
	var $pie2 = $("#flot-placeholder-pie2");
	var $line = $("#flot-placeholder-line");


	var dataSetPieDefault = [
	    { label: "已賣出", data: 0, color: "#005CDE" },
	    { label: "剩餘票數", data: 100, color: "#00A36A" },
	];

	var totalPie1 = 100000;
	var totalPie2 = 50000;

	var dataSetPie1 = $.extend(true, [], dataSetPieDefault);
	var dataSetPie2 = $.extend(true, [], dataSetPieDefault);


	var optionsPie = {
		series: {
		    pie: {
		        show: true,                
		        label: {
		            show:true,
		            radius: 0.8,
		            formatter: function (label, series) {             
		                return '<div style="border:1px solid grey;font-size:20px;text-align:center;padding:5px;color:white;">' +
		                label + ': ' +
		                Math.round(series.percent) +
		                '%</div>';
		            },
		            background: {
		                opacity: 0.8,
		                color: '#000'
		            }
		        }
		    }
		}		
	};


    var dataSetLineDefault = [
    	{ label: "", data: [], points: { symbol: "circle"} },
    ];

    var dataSetLine = $.extend(true, [], dataSetLineDefault);

    var optionsLine = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2
            },
            points: {
                radius: 3,
                fill: true,
                show: true
            }
        },
        xaxis: {
            mode: "time",
            tickSize: [2, "second"],
            tickFormatter: function (v, axis) {
		        var date = new Date(v);
		 
		        if (date.getSeconds() % 10 == 0) {
		            var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		            var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
		 
		            return hours + ":" + minutes + ":" + seconds;
		        } else {
		            return "";
		        }
		    },
            axisLabel: "秒",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        },
        yaxes: [{
            axisLabel: "訂單數",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            tickFormatter: function (v, axis) {
                return $.formatNumber(v, { format: "#,###", locale: "us" });
            }
        }
      ],
        legend: {
            noColumns: 0,
            labelBoxBorderColor: "#000000",
            position: "nw"
        },
        grid: {
            hoverable: true,
            borderWidth: 2,
            borderColor: "#633200",
            backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
        },
        colors: ["#FF0000", "#0022FF"]
    };




 


    var updateInterval = 2000;
    var now = new Date().getTime();
    var value = 0;
	var timerId = null;
	var soldTickets8 = 0;
	var soldTickets9 = 0;


	var updateChart = function() {
		$.plot($($pie1), dataSetPie1, optionsPie);
		$.plot($($pie2), dataSetPie2, optionsPie);
		$.plot($($line), dataSetLine, optionsLine);
	};


	var resetChart = function() {

		$tickets.html(0);
		dataSetPie1 = $.extend(true, [], dataSetPieDefault);
		dataSetPie2 = $.extend(true, [], dataSetPieDefault);
		dataSetLine = $.extend(true, [], dataSetLineDefault);

		updateChart();
	};


	var updateData = function() {



		$.get('http://rocket-win.cloudapp.net:5001/v1/orders/sale-report', {}, null)
		.then(function(data) {

			if (dataSetLine[0].data.length > 10) {
				dataSetLine[0].data.shift();
			}

			value += 10;

			$tickets.html(data.orderCount);
			dataSetLine[0].data.push([now += updateInterval, data.orderCount]);


			soldTickets8 = totalPie1 - data.ticketClass_8_count;
			soldTickets9 = totalPie2 - data.ticketClass_9_count;


			dataSetPie1[0].data = soldTickets8;
			dataSetPie1[1].data = data.ticketClass_8_count;

			dataSetPie2[0].data = soldTickets9;
			dataSetPie2[1].data = data.ticketClass_9_count;

			$count8.html(soldTickets8);
			$count9.html(soldTickets9);


			updateChart();
			clearTimeout(timerId);

			timerId = setTimeout(function() {
				updateData();
			}, updateInterval)

		})
		.fail(function() {

		});


	};

	var myTimeoutFunc = function() {
		updateData();
		timerId= setTimeout(myTimeoutFunc, updateInterval);
	};

	var goInit = function() {
		$('#go').click(function(e) {
			e.preventDefault();
			myTimeoutFunc();
		});	

		$('#stop').click(function(e) {
			e.preventDefault();
			clearTimeout(timerId);

		});

		$('#reset').click(function(e) {
			e.preventDefault();
			resetChart();
		});
	};

	$(function() {
		//myTimeoutFunc();
		updateChart();
		goInit();
	});

}).call(this)
