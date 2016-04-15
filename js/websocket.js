/////////////////////////////////////////////////////////////////////////////////////////////////
// Please don't modified the following codes at any time.

var port = parseInt(process.argv[2]);
var debug = JSON.parse(process.argv[3]);
var home_dir = process.argv[4];
var root_dir = process.env['COMX_SDK'];

var runningLog = "Y:\\nxcocadframework\\data\\Running.log";

var deamon_service_id = "0x86d51be5-0x4254-0x4848-0x88-0xf2-0xb5-0x8a-0x62-0x04-0xfb-0x79";
process.chdir(home_dir + 'js/');

var websocket = require(root_dir + 'js/socket.io/websocket.common.js');



function InvokeDeamonMgr(cb)

{

    websocket.RemoteInvoke('localhost', '20000', function(ws_remote){

        deamon_mgr = ws_remote;

        if(deamon_mgr)

        {

            cb(deamon_mgr, function()/*dispose callback*/{

                deamon_mgr.dispose();

            });

        }

        else

        {

            //alert('Ô¶³ÌÁ¬½ÓÊ§°Ü');

            console.log('remote connect faile');

        }

    });

}



function OnInit()
{
    InvokeDeamonMgr(function(deamon_mgr, dispose_cb){

        deamon_mgr.Invoke('Register', 

            {'id' : deamon_service_id, 'name' : name, 'port' : port}, 

            function(data){

                if(!data.parameters.ret)

                {

                    websocket.InvokeLocal('Exit', {}, function(data){});

                }

                

                dispose_cb();

            }

        );

    });

    websocket.InvokeLocal('OnWebsocketReady', {}, function(data){
        //nothing.
    });
}

function OnConnectionsRefChanged(cnt)
{
    websocket.Invoke('ConnectionsRefChanged', {'num' : cnt}, function(data){});
}

websocket.start(port, debug, OnInit, OnConnectionsRefChanged);

websocket.on("exit", function(data){
    InvokeDeamonMgr(function(deamon_mgr, dispose_cb){

        deamon_mgr.Invoke('Unregister', 

            {'id' : deamon_service_id}, 

            function(data){

                dispose_cb();

                process.exit();

            }

        );

    });
});

websocket.on("Exit", function(data){
    websocket.InvokeLocal('Exit', {}, function(data){});
});

websocket.on("ShowWindow", function(data){
    websocket.InvokeLocal('ShowWindow', {}, function(data){});
});

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    //console.log("Node NOT Exiting...");
    websocket.InvokeLocal('error', {"message" : err.message});
});

/////////////////////////////////////////////////////////////////////////////////////////////////
// Append your codes here please.

websocket.on('GetConnectionsNum', function(data){
    data.parameters = {'num' : websocket.GetConnectionsNum()};
    websocket.send(data);
});

websocket.on('GetPort', function(data){
    data.parameters = {'port' : port};
    websocket.send(data);
});

var name = 'NXCOCADService';

websocket.on('GetName', function(data){
    data.parameters = {'name' : name};
    websocket.send(data);
});

websocket.on('GetID', function(data){
    data.parameters = {'id' : deamon_service_id};
    websocket.send(data);
});

websocket.on('ShowDeamonMgr', function(data){
    InvokeDeamonMgr(function(deamon_mgr, dispose_cb){

        deamon_mgr.Invoke('ShowMainWindow', {}, 

            function(idata){

                dispose_cb();

            }

        );

    });
});
//OnActionFire
websocket.on('OnActionFire', function(data){
    var actionID = data.parameters.actionID;
    var clientID = data.parameters.clientID;
    var parameters = data.parameters.parameters;
    appendFileSync(runningLog, "Received message from client:" + clientID + " actionID:" + actionID);
    data.parameters.ret = "Server has received the message: clientID:" + clientID + " actionID:" + actionID;
    websocket.send(data);
    if(actionID == "CreatePoint")
    {
        appendFileSync(runningLog, "Parameters:" + parameters.CoordinateX + " " + parameters.CoordinateY + " " + parameters.CoordinateZ);
        websocket.Invoke('CoCADCreatePoint', {'sourceID' : clientID, 'parameters' : parameters}, function(data){
            appendFileSync(runningLog, data.parameters.ret);
        });        
        }

});

//InvokeTestConnection
websocket.on('InvokeTestConnection', function(data){
    require('fs').writeFileSync(runningLog, data.parameters.res + "\n");
});

//Util

function sleep(n)

{

    var start=new Date().getTime();

    while(true) if(new Date().getTime()-start>n) break;

}



function appendFileSync(fileName, data)

{

    var logString = require('fs').readFileSync(fileName);

    require('fs').writeFileSync(fileName, logString + data + "\n");

}