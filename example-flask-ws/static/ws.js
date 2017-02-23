
var ws;                 // WebSocket
var prev_data;          // remember data fetched last time
var bathroom_status;
var prev_bathroom_status;
/**
 *  Establish a WebSocket if possible.
 */
function establish_websocket(port) {
    if ("WebSocket" in window) {
        ws = new WebSocket("ws://" + document.domain + ":" + port.toString() + "/updated");
        ws.onstart = function() {
            ws.send('started');
        }
        ws.onmessage = function (msg) {
            load_data();
        };
        ws.onclose = function (msg) {
            $("#updated").html('SERVER DISCONNECT');
            $("#updated").css('backgroundColor', '#FFCCFF');
            $("#updated").fadeIn('fast');
        };

        // load the initial data
        load_data();
    } else {
        alert("WebSocket not supported");
    }
}

/**
 *  Load updated data from /data, optionally providing a query parameter
 *  read from the #status select.
 */
function load_data() {
    var status =  $('select#status option:selected')[0].value;
    bathroom_status = status;
    var url = '/data' + (status ? "?status=" + status : "");
    $.ajax({ url:     url,
             success: function(data) {
                          display_data(data);
                      },
    });
    return true;
}

/**
 *  Show the data acquired by load_data()
 */
function display_data(data) {
    if (data && (data != prev_data)) {      // if data and it's changed

        // compute a message to display comparing current data with previous data
        var delta_msg;
        if (prev_data && bathroom_status == prev_bathroom_status) {
            console.log("data.value:", data.value, "prev_data.value:", prev_data.value);
            var delta_value = data.value - prev_data.value;
            delta_msg = '<b>' + delta_value.toFixed(0) + 's</b>';
        }
        else {
            console.log("data.value:", data.value, "no prev_data");
            delta_msg = ' (first data point)';
        }

        // update the contents of several HTML divs via jQuery
        if(bathroom_status == 'available' && bathroom_status != prev_bathroom_status){
            $("#occupied").fadeOut('slow');
            $("#available").fadeIn('fast');
         }
        else if (bathroom_status != prev_bathroom_status){
            $("#available").fadeOut('slow');
            $("#occupied").fadeIn('fast');
        }

        // remember this data, in case want to compare it to next update
        if(bathroom_status != prev_bathroom_status)
            prev_data = data;

        $('div#value').html(delta_msg);
        $('div#contents').html(data.contents);
        // a little UI sparkle - show the #updated div, then after a little
        // while, fade it away
        //$("#updated").fadeIn('fast');
        //setTimeout(function() {  $("#updated").fadeOut('slow');  }, 2500);
        prev_bathroom_status = bathroom_status;
    }
}

/**
 *  Inital document setup - hide the #updated message, and provide a
 *  "loading..." message
 */
$(document).ready(function() {
    $("div#updated").fadeOut(0);
    $("div#contents").append("awaiting data...");
    $("select#status").on('change', load_data);
    $("div#contents, div#value").on('click', load_data);
});

